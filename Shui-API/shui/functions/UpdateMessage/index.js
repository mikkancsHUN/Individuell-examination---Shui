const { db } = require('../../services/index');
const { sendResponse, sendError } = require('../../responses/index');

exports.handler = async (event) => {
  const { id } = event.pathParameters;
  const { username, message } = JSON.parse(event.body);

  if (!username || !message) {
    return sendError(400, { message: "Username and message are required." });
  }

  try {
    const result = await db.get({
      TableName: 'messages-db',
      Key: { id: id },
    });

    const Item = result.Item;

    if (!Item) {
      return sendError(404, { message: "Message not found." });
    }

    if (Item.username !== username) {
      return sendError(403, { message: "You can only update your own messages." });
    }

    await db.update({
      TableName: 'messages-db',
      Key: { id: id },
      UpdateExpression: 'set username = :username, #msg = :message',
      ExpressionAttributeNames: {
        '#msg': 'text',
      },
      ExpressionAttributeValues: {
        ':username': username,
        ':message': message,
      },
      ReturnValues: 'ALL_NEW'
    });

    return sendResponse(200, { message: "Message updated successfully", id, username, message });

  } catch (error) {
    return sendError(500, { message: error.message });
  }
};
