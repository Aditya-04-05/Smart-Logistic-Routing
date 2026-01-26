import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";

const App = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Logistics Dashboard</h1>

      <nav style={{ marginBottom: "20px" }}>
        <Link to="/" style={{ marginRight: "15px" }}>
          Dashboard
        </Link>
        <Link to="/orders">Orders</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </div>
  );
};

export default App;
