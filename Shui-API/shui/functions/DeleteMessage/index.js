const { db } = require('../../services/index');
const { sendResponse, sendError } = require('../../responses/index');

exports.handler = async (event) => {
  const { id } = event.pathParameters;

  try {
    await db.delete({
      TableName: 'messages-db',
      Key: { id: id },
    });

    return sendResponse(200, { message: "Message deleted successfully", id });
  } catch (error) {
    return sendError(500, { message: error.message });
  }
};
