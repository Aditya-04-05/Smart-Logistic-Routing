const { successResponse, errorResponse } = require("../utils/response");

const runAssignment = async (req, res) => {
  try {
    return successResponse(res, 200, "Assignment engine endpoint ready", {});
  } catch (error) {
    console.error("Run Assignment Error:", error);
    return errorResponse(res, 500, "Failed to run assignment engine");
  }
};

module.exports = {
  runAssignment,
};
