import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [vehiclesRes, ordersRes] = await Promise.all([
        api.get("/vehicles"),
        api.get("/orders"),
      ]);

      setVehicles(vehiclesRes.data.data.vehicles);
      setOrders(ordersRes.data.data.orders || ordersRes.data.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  const runAssignment = async () => {
    try {
      setLoading(true);
      await api.post("/assignments/run");
      await fetchData(); // refresh counts
    } catch (err) {
      console.error("Assignment run failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(
    (v) => v.status === "AVAILABLE",
  ).length;
  const busyVehicles = vehicles.filter((v) => v.status === "BUSY").length;

  const totalOrders = orders.length;
  const createdOrders = orders.filter((o) => o.status === "CREATED").length;
  const assignedOrders = orders.filter((o) => o.status === "ASSIGNED").length;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      <div>
        <h3>Vehicles</h3>
        <p>Total: {totalVehicles}</p>
        <p>Available: {availableVehicles}</p>
        <p>Busy: {busyVehicles}</p>
      </div>

      <div>
        <h3>Orders</h3>
        <p>Total: {totalOrders}</p>
        <p>Created: {createdOrders}</p>
        <p>Assigned: {assignedOrders}</p>
      </div>

      <button onClick={runAssignment} disabled={loading}>
        {loading ? "Running..." : "Run Assignment Engine"}
      </button>
      <button onClick={() => navigate("/orders")}>See Orders</button>
    </div>
  );
};

export default Dashboard;
