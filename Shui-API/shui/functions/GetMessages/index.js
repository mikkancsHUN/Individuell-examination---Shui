const { db } = require('../../services/index');
const { sendResponse, sendError } = require('../../responses/index');

exports.handler = async (event) => {
    try {
      const { Items } = await db.scan({
        TableName: 'messages-db',
      });
      return sendResponse(200, { message : Items });

    } catch(error) {
        return sendError(404, { message : error.message });
    }
};
