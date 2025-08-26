import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "./App.css";

// إصلاح أيقونات Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function App() {
  const [drones, setDrones] = useState([]);

  return (
    <div className="app-container">
      {/* Dashboard بسيط */}
      <div className="dashboard">
        <div className="dashboard-item">
          <h3>Sager Drone System</h3>
          <p>System is running</p>
        </div>
      </div>
      
      <div className="main-content">
        {/* Side Panel بسيط */}
        <div className="side-panel">
          <h2>Drones List</h2>
          <div className="no-drones">No drones connected yet</div>
          <div className="red-count">Red Drones Count: 0</div>
        </div>
        
        {/* الخريطة */}
        <MapContainer 
          center={[31.95, 35.91]} 
          zoom={10} 
          className="map-container"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          
          <Marker position={[31.95, 35.91]}>
            <Popup>Test location</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default App;