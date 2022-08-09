/**
 * Route: POST /note
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const moment = require('moment');
const uuid = require('uuid');
const util = require('./util');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

module.exports.add = async (event) => {
  try {
    let item = JSON.parse(event.body).Item;
    item.user_id = util.getUserId(event.headers);
    item.user_name = util.getUserName(event.headers);
    item.note_id = item.user_id + ':' + uuid.v4();
    item.timestamp = moment().unix();
    item.expires = moment().add(90, 'days').unix();
    let data = await dynamodb
      .put({
        TableName: tableName,
        Item: item,
      })
      .promise();

    return {
      statusCode: 200,
      headers: util.getResponseHeaders(),
      body: JSON.stringify(item),
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
