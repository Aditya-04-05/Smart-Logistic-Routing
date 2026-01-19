require("dotenv").config();
const express = require("express");
require("./config/db");
const vehicleRoutes = require("./routes/vehicle.routes");
const orderRoutes = require("./routes/order.routes");
const app = express();

app.use(express.json());
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/orders", orderRoutes);
app.get("/", (req, res) => {
  res.send("Logistic Backend running");
});

module.exports = app;
