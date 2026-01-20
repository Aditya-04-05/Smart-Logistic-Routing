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

const getOrders = async (req, res) => {
  try {
    const query = `
            SELECT id,
            pickup_lat,
            pickup_lng,
            drop_lat,
            drop_lng,
            priority,
            status,
            created_at
            FROM orders
        ORDER BY created_at DESC`;

    const result = await pool.query(query);

    return successResponse(res, 200, "Orders Fetched Successfully", {
      count: result.rows.length,
      orders: result.rows,
    });
  } catch (error) {
    console.error("Get Orders Error: ", error);
    return errorResponse(res, 200, "Internal Server Error GetOrdersError");
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return errorResponse(res, 400, "Order Id is requires");
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      return errorResponse(res, 400, "invalid order id format");
    }

    const allowedStatus = [
      "CREATED",
      "ASSIGNED",
      "IN_PROGRESS",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!status || !allowedStatus.includes(status)) {
      return errorResponse(
        res,
        400,
        "status must be CREATED, ASSIGNED, IN_PROGRESS, DELIVERED, or CANCELLED",
      );
    }

    const query = `UPDATE orders SET status =$1 WHERE id = $2 RETURNING *`;

    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return errorResponse(res, 404, "Order not found");
    }

    return successResponse(
      res,
      200,
      "Order status updated successfully",
      result.rows[0],
    );
  } catch (error) {
    console.error("Update Order Status Error: ", error);
    return errorResponse(
      res,
      500,
      "Internal Server Error: Update order status",
    );
  }
};
module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
};
