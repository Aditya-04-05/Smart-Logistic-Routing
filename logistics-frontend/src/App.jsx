import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Vehicles from "./pages/Vehicles";

const App = () => {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Logistics Dashboard</h1>

      <div className="nav">
        <Link to="/">Dashboard</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/vehicles">Vehicles</Link>
      </div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/vehicles" element={<Vehicles />} />
      </Routes>
    </div>
  );
};

export default App;
