/**
 * Route: GET /note/n/{note_id}
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const _ = require('underscore');
const util = require('./util');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

module.exports.get = async (event) => {
  try {
    let note_id = decodeURIComponent(event.pathParameters.note_id);

    let params = {
      TableName: tableName,
      IndexName: 'note_id-index',
      KeyConditionExpression: 'note_id = :note_id',
      ExpressionAttributeValues: {
        ':note_id': note_id,
      },
      Limit: 1,
    };
    let data = await dynamodb.query(params).promise();

    if (!_.isEmpty(data.Items)) {
      return {
        statusCode: 200,
        headers: util.getResponseHeaders(),
        body: JSON.stringify(data.Items[0]),
      };
    }

    return {
      statusCode: 404,
      headers: util.getResponseHeaders(),
    };
  } catch (e) {
    console.log('Error', e);
    return {
      statusCode: e.statuscode ? e.statusCode : 500,
      headers: util.getResponseHeaders(),
      body: JSON.stringify({
        error: e.name ? e.name : 'Exception',
        message: e.message ? e.message : 'Unknown error',
      }),
    };
  }
};
