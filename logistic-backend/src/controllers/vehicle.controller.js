const pool = require("../config/db");

const createVehicle = async (req, res) => {
  try {
    const { capacity } = req.body;
    if (!capacity) {
      return res.status(400).json({ error: "capacity is required" });
    }

    const query = `
        INSERT INTO vehicles(capacity)
        VALUES ($1)
        RETURNING *
        `;

    const result = await pool.query(query, [capacity]);
    return res.status(201).json({
      message: "vehicle created succesfully",
      vehicle: result.rows[0],
    });
  } catch (error) {
    console.error("Create Vehicle Error", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error Create Vehicle" });
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
  updateVehicleStatus
};
