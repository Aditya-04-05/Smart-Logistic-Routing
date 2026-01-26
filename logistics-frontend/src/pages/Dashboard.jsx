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
      console.error("Dashboard fetch failed", err);
    }
  };

  const runAssignment = async () => {
    try {
      setLoading(true);
      await api.post("/assignments/run");
      await fetchData();
    } catch (err) {
      console.error("Assignment failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableVehicles = vehicles.filter(
    (v) => v.status === "AVAILABLE",
  ).length;
  const busyVehicles = vehicles.filter((v) => v.status === "BUSY").length;

  const createdOrders = orders.filter((o) => o.status === "CREATED").length;
  const assignedOrders = orders.filter((o) => o.status === "ASSIGNED").length;

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="sectiom">
        <h3>Vehicles</h3>
        <p>Total: {vehicles.length}</p>
        <p>Available: {availableVehicles}</p>
        <p>Busy: {busyVehicles}</p>
      </div>
      <div className="sectio">
        <h3>Orders</h3>
        <p>Total: {orders.length}</p>
        <p>Created: {createdOrders}</p>
        <p>Assigned: {assignedOrders}</p>
      </div>
      <button onClick={runAssignment}>Run Assignment Engine</button>
      <button className="secondary" onClick={() => navigate("/orders")}>
        See Orders
      </button>
    </div>
  );
};

export default Dashboard;
