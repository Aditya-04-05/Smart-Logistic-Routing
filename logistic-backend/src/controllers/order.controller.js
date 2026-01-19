const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const createOrder = async (req, res) => {
  try {
    const {
      pickup_lat,
      pickup_lng,
      drop_lat,
      drop_lng,
      priority = "NORMAL",
    } = req.body;

    if (
      pickup_lat === undefined ||
      pickup_lng === undefined ||
      drop_lat === undefined ||
      drop_lng === undefined
    ) {
      return errorResponse(
        res,
        400,
        "Pickup and drop coordinates are required",
      );
    }

    const cords = [pickup_lat, pickup_lng, drop_lat, drop_lng];
    for (const c of cords) {
      if (typeof c != "number" || !Number.isFinite(c)) {
        return errorResponse(res, 400, "Coordinates must be valid number");
      }
    }
    if (
      pickup_lat < -90 ||
      pickup_lat > 90 ||
      drop_lat < -90 ||
      drop_lat > 90 ||
      pickup_lng < -180 ||
      pickup_lng > 180 ||
      drop_lng < -180 ||
      drop_lng > 180
    ) {
      return errorResponse(res, 400, "Invalid latitude or longitude range");
    }
    const allowedPriorities = ["LOW", "NORMAL", "HIGH"];
    if (!allowedPriorities.includes(priority)) {
      return errorResponse(res, 400, "priority must be LOW, NORMAL, or HIGH");
    }
    const query = `
            INSERT INTO orders (
                pickup_lat, pickup_lng,
                drop_lat, drop_lng,
                priority
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
    const result = await pool.query(query, [
      pickup_lat,
      pickup_lng,
      drop_lat,
      drop_lng,
      priority,
    ]);
    return successResponse(
      res,
      201,
      "Order created successfully",
      result.rows[0],
    );
  } catch (error) {
    console.error("Create order error: ", error);
    return errorResponse(res, 500, "Internal Server Error CreateOrder");
  }
};

module.exports = {
  createOrder,
};
