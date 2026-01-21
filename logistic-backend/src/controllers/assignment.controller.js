const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const assignOrderToVehicle = async (req, res) => {
  try {
    const { order_id, vehicle_id } = req.body;

    // 1️⃣ Required check
    if (!order_id || !vehicle_id) {
      return errorResponse(res, 400, "order_id and vehicle_id are required");
    }

    // 2️⃣ UUID validation
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(order_id) || !uuidRegex.test(vehicle_id)) {
      return errorResponse(res, 400, "Invalid UUID format");
    }

    // 3️⃣ Check order exists
    const orderCheck = await pool.query("SELECT id FROM orders WHERE id = $1", [
      order_id,
    ]);
    if (orderCheck.rows.length === 0) {
      return errorResponse(res, 404, "Order not found");
    }

    // 4️⃣ Check vehicle exists
    const vehicleCheck = await pool.query(
      "SELECT id, status FROM vehicles WHERE id = $1",
      [vehicle_id],
    );
    if (vehicleCheck.rows.length === 0) {
      return errorResponse(res, 404, "Vehicle not found");
    }

    // 5️⃣ Vehicle availability check
    if (vehicleCheck.rows[0].status !== "AVAILABLE") {
      return errorResponse(res, 400, "Vehicle is not AVAILABLE");
    }

    // 6️⃣ Create assignment
    const insertQuery = `
      INSERT INTO order_vehicle_assignments (order_id, vehicle_id)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [order_id, vehicle_id]);

    return successResponse(
      res,
      201,
      "Order assigned to vehicle successfully",
      result.rows[0],
    );
  } catch (error) {
    console.error("Assignment Error:", error);
    return errorResponse(res, 500, "Failed to assign order to vehicle");
  }
};

module.exports = {
  assignOrderToVehicle,
};
