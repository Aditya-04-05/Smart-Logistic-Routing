import { useEffect, useState } from "react";
import api from "../api/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add order form
  const [form, setForm] = useState({
    pickup_lat: "",
    pickup_lng: "",
    drop_lat: "",
    drop_lng: "",
    priority: "MEDIUM",
  });

  // Edit order
  const [editingOrder, setEditingOrder] = useState(null);

  // History modal
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // ---------------- FETCH ORDERS ----------------
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders");
      setOrders(res.data.data.orders || res.data.data);
    } catch (err) {
      console.error("Fetch orders failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ---------------- CREATE ORDER ----------------
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
      console.error("Create order failed", err);
    }
  };

  // ---------------- EDIT ORDER ----------------
  const startEdit = (order) => {
    setEditingOrder({
      id: order.id,
      priority: order.priority,
      drop_lat: order.drop_lat,
      drop_lng: order.drop_lng,
    });
  };

  const updateOrder = async () => {
    try {
      await api.put(`/orders/${editingOrder.id}`, {
        priority: editingOrder.priority,
        drop_lat: Number(editingOrder.drop_lat),
        drop_lng: Number(editingOrder.drop_lng),
      });

      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      console.error("Update order failed", err);
    }
  };

  // ---------------- ORDER HISTORY ----------------
  const openHistory = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/history`);

      setHistory(res.data.data?.events || []);
      setSelectedOrderId(orderId);
      setShowHistory(true);
    } catch (err) {
      console.error("History fetch failed", err);
      setHistory([]);
      setShowHistory(true);
    }
  };

  // ---------------- UI ----------------
  return (
    <div style={{ padding: "20px" }}>
      <h2>Orders</h2>

      {/* ADD ORDER */}
      <div className="section">
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
      <hr />

      {/* ORDERS TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Drop</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id.slice(0, 8)}</td>
                <td>{o.status}</td>
                <td>{o.priority}</td>
                <td>
                  {o.drop_lat}, {o.drop_lng}
                </td>
                <td>
                  <button onClick={() => openHistory(o.id)}>History</button>
                  {o.status === "CREATED" && (
                    <button onClick={() => startEdit(o)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* EDIT MODAL */}
      {editingOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div style={{ background: "#fff", padding: "20px", width: "400px" }}>
            <h3>Edit Order</h3>

            <select
              value={editingOrder.priority}
              onChange={(e) =>
                setEditingOrder({
                  ...editingOrder,
                  priority: e.target.value,
                })
              }
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>

            <input
              value={editingOrder.drop_lat}
              onChange={(e) =>
                setEditingOrder({
                  ...editingOrder,
                  drop_lat: e.target.value,
                })
              }
            />
            <input
              value={editingOrder.drop_lng}
              onChange={(e) =>
                setEditingOrder({
                  ...editingOrder,
                  drop_lng: e.target.value,
                })
              }
            />

            <br />
            <button onClick={updateOrder}>Save</button>
            <button onClick={() => setEditingOrder(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistory && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              width: "500px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3>Order History</h3>
            <p>Order ID: {selectedOrderId}</p>

            {history.length === 0 ? (
              <p>No history available</p>
            ) : (
              <ul>
                {history.map((h) => (
                  <li key={h.id} style={{ marginBottom: "10px" }}>
                    <strong>{h.old_status}</strong> →{" "}
                    <strong>{h.new_status}</strong>
                    <br />
                    <small>{new Date(h.changed_at).toLocaleString()}</small>
                    <br />
                    <em>{h.note}</em>
                  </li>
                ))}
              </ul>
            )}

            <button onClick={() => setShowHistory(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
