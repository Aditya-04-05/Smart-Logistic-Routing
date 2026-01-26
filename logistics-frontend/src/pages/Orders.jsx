import { useEffect, useState } from "react";
import api from "../api/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    pickup_lat: "",
    pickup_lng: "",
    drop_lat: "",
    drop_lng: "",
    priority: "MEDIUM",
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders");
      setOrders(res.data.data.orders || res.data.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    try {
      await api.post("/orders", {
        pickup_lat: Number(form.pickup_lat),
        pickup_lng: Number(form.pickup_lng),
        drop_lat: Number(form.drop_lat),
        drop_lng: Number(form.drop_lng),
        priority: form.priority,
      });

      setForm({
        pickup_lat: "",
        pickup_lng: "",
        drop_lat: "",
        drop_lng: "",
        priority: "MEDIUM",
      });

      fetchOrders();
    } catch (err) {
      console.error("Failed to create order", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Orders</h2>

      {/* ADD ORDER */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Add Order</h3>

        <input
          placeholder="Pickup Lat"
          value={form.pickup_lat}
          onChange={(e) => setForm({ ...form, pickup_lat: e.target.value })}
        />
        <input
          placeholder="Pickup Lng"
          value={form.pickup_lng}
          onChange={(e) => setForm({ ...form, pickup_lng: e.target.value })}
        />
        <input
          placeholder="Drop Lat"
          value={form.drop_lat}
          onChange={(e) => setForm({ ...form, drop_lat: e.target.value })}
        />
        <input
          placeholder="Drop Lng"
          value={form.drop_lng}
          onChange={(e) => setForm({ ...form, drop_lng: e.target.value })}
        />

        <select
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

        <button onClick={createOrder}>Create Order</button>
      </div>

      {/* ORDERS TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Pickup</th>
              <th>Drop</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id.slice(0, 8)}</td>
                <td>{order.status}</td>
                <td>{order.priority}</td>
                <td>
                  {order.pickup_lat}, {order.pickup_lng}
                </td>
                <td>
                  {order.drop_lat}, {order.drop_lng}
                </td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Orders;
