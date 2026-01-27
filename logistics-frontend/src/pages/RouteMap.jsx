import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import api from "../api/api";
import "leaflet/dist/leaflet.css";

/**
 * Creates a numbered circular marker for route order
 */
const createNumberedIcon = (number) =>
  L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background:#2563eb;
        color:white;
        width:28px;
        height:28px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:14px;
        font-weight:bold;
        border:2px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
      ">
        ${number}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const RouteMap = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [stops, setStops] = useState([]);

  // Fetch all vehicles
  useEffect(() => {
    api
      .get("/vehicles")
      .then((res) => setVehicles(res.data.data.vehicles))
      .catch((err) => console.error("Failed to fetch vehicles", err));
  }, []);

  // Fetch route for selected vehicle
  useEffect(() => {
    if (!selectedVehicle) return;

    api
      .get(`/routes/vehicle/${selectedVehicle}`)
      .then((res) => setStops(res.data.data.stops || []))
      .catch((err) => {
        console.error("Failed to fetch route", err);
        setStops([]);
      });
  }, [selectedVehicle]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Route Map View</h2>

      {/* Vehicle Selector */}
      <select
        value={selectedVehicle}
        onChange={(e) => setSelectedVehicle(e.target.value)}
      >
        <option value="">Select Vehicle</option>
        {vehicles.map((v) => (
          <option key={v.id} value={v.id}>
            {v.id.slice(0, 8)}
          </option>
        ))}
      </select>

      {/* Map */}
      <div style={{ height: "500px", marginTop: "20px" }}>
        <MapContainer
          center={[28.61, 77.21]} // Default center (Delhi)
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Numbered Drop Points */}
          {stops.map((s, idx) => (
            <Marker
              key={idx}
              position={[s.lat, s.lng]}
              icon={createNumberedIcon(idx + 1)}
            >
              <Popup>
                <strong>Stop {idx + 1}</strong>
                <br />
                Order ID: {s.order_id.slice(0, 8)}
              </Popup>
            </Marker>
          ))}

          {/* Route Line */}
          {stops.length > 1 && (
            <Polyline
              positions={stops.map((s) => [s.lat, s.lng])}
              color="blue"
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default RouteMap;
