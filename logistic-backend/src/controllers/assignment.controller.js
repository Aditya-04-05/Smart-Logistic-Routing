const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const assignOrderToVehicle = async (req, res) => {
  const client = await pool.connect(); // 🔐 start transaction client

  try {
    const { order_id, vehicle_id } = req.body;

    // 1️⃣ Basic checks
    if (!order_id || !vehicle_id) {
      return errorResponse(res, 400, "order_id and vehicle_id are required");
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(order_id) || !uuidRegex.test(vehicle_id)) {
      return errorResponse(res, 400, "Invalid UUID format");
    }

    // 🔐 BEGIN TRANSACTION
    await client.query("BEGIN");

    // 2️⃣ Check order exists & status
    const orderRes = await client.query(
      "SELECT id, status FROM orders WHERE id = $1",
      [order_id],
    );

    if (orderRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return errorResponse(res, 404, "Order not found");
    }

    if (orderRes.rows[0].status !== "CREATED") {
      await client.query("ROLLBACK");
      return errorResponse(res, 400, "Only CREATED orders can be assigned");
    }

    // 3️⃣ Check vehicle exists & availability
    const vehicleRes = await client.query(
      "SELECT id, status FROM vehicles WHERE id = $1",
      [vehicle_id],
    );

    if (vehicleRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return errorResponse(res, 404, "Vehicle not found");
    }

    if (vehicleRes.rows[0].status !== "AVAILABLE") {
      await client.query("ROLLBACK");
      return errorResponse(res, 400, "Vehicle is not AVAILABLE");
    }

    // 4️⃣ Create assignment
    const assignmentRes = await client.query(
      `
      INSERT INTO order_vehicle_assignments (order_id, vehicle_id)
      VALUES ($1, $2)
      RETURNING *
      `,
      [order_id, vehicle_id],
    );

    // 5️⃣ Auto-update order status
    await client.query("UPDATE orders SET status = 'ASSIGNED' WHERE id = $1", [
      order_id,
    ]);

    // 6️⃣ Auto-update vehicle status
    await client.query("UPDATE vehicles SET status = 'BUSY' WHERE id = $1", [
      vehicle_id,
    ]);

    // 🔐 COMMIT TRANSACTION
    await client.query("COMMIT");

    return successResponse(
      res,
      201,
      "Order assigned and statuses updated",
      assignmentRes.rows[0],
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Auto Assignment Error:", error);
    return errorResponse(res, 500, "Failed to assign order");
  } finally {
    client.release(); // 🔓 release connection
  }
};

module.exports = {
  assignOrderToVehicle,
};
