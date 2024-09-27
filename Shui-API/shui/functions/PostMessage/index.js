const { db } = require('../../services/index');
const { sendResponse, sendError } = require('../../responses/index');
const { v4 : uuid } = require('uuid');

exports.handler = async (event) => {
  let username, message;
  try {
    ({ username, message } = JSON.parse(event.body));
} catch (error) {
    return sendError(400, { message: "Invalid JSON format." });
}
  const id = uuid().substring(0, 7);
  const createdAt = new Date().toISOString();


 if(username && message) {
  try {
      await db.put({
        TableName: 'messages-db',
        Item: {
          id: id,
          username: username,
          text: message,
          createdAt: createdAt
        }
      });
      return sendResponse(200, { message: "Message added successfully", id, username, createdAt });

  } catch(error) {
    console.error("DynamoDB Error: ", error);
    return sendError(500, { message : error.message });
  }
 } else {
  return sendError(404, { message: "Username and message are required." });
 }
};
