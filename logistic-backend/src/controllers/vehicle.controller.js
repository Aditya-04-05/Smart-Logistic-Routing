const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const createVehicle = async (req, res) => {
  try {
    const { capacity } = req.body;
    // capacity empty
    if (capacity === undefined) {
      return errorResponse(res, 400, "capacity is required");
    }

    // capacity abc
    if (typeof capacity !== "number") {
      return errorResponse(res, 400, "capacity must be a number");
    }

    // capacity negative
    if (capacity <= 0) {
      return errorResponse(res, 400, "capacity must be greater than 0");
    }

    const query = `
        INSERT INTO vehicles(capacity)
        VALUES ($1)
        RETURNING *
        `;

    const result = await pool.query(query, [capacity]);
    return successResponse(
      res,
      201,
      "Vehicle Created Successfully",
      result.rows[0],
    );
  } catch (error) {
    console.error("Create Vehicle Error", error);
    return errorResponse(
      res,
      500,
      "Internal Server Error : CreateVehicleController",
    );
  }
};

const getAllVehicles = async (req, res) => {
  try {
    const query = "SELECT * FROM vehicles ORDER BY created_at DESC";
    const result = await pool.query(query);
    return res.status(200).json({
      count: result.rows.length,
      vehicles: result.rows,
    });
  } catch (error) {
    console.error("Get Vehicles error: ", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error Get Vehicles" });
  }
};

const updateVehicleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["AVAILABLE", "BUSY", "OFFLINE"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid statua" });
    }

    const query = `UPDATE vehicles SET status = $1 WHERE id = $2 RETURNING *`;
    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Vehicle Not Found" });
    }
    return res.status(200).json({
      message: "Vehicle Status Updated",
      vehicle: result.rows[0],
    });
  } catch (error) {
    console.error("Update Vehicle Error: ", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error Update Vehicle Status" });
  }
};
module.exports = {
  createVehicle,
  getAllVehicles,
  updateVehicleStatus,
};
