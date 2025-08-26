import React, { useEffect, useMemo, useCallback, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from 'leaflet';
import { useDroneStore } from "./store";
import SidePanel from "./components/SidePanel";
import Dashboard from "./components/Dashboard";
import "leaflet/dist/leaflet.css";
import "./App.css";
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// استبدل WebSocket بـ Socket.IO client
import { io } from "socket.io-client";



// إصلاح لأيقونات Leaflet الافتراضية
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

// Focus map on selected drone
function FocusMap({ drone }) {
  const map = useMap();
  useEffect(() => {
    if (drone) {
      map.setView([drone.lat, drone.lng], 15);
    }
  }, [drone, map]);
  return null;
}

// Map events component to track viewport
function MapEvents({ onViewportChange }) {
  const map = useMapEvents({
    moveend: () => {
      onViewportChange(map.getBounds());
    },
    zoomend: () => {
      onViewportChange(map.getBounds());
    }
  });
  
  useEffect(() => {
    onViewportChange(map.getBounds());
  }, [map, onViewportChange]);
  
  return null;
}

// إنشاء أيقونة مخصصة للطائرة مع اتجاه Yaw
const createDroneIcon = (yaw, isRed) => {
  return L.divIcon({
    html: `
      <div style="
        transform: rotate(${yaw}deg);
        color: ${isRed ? 'red' : 'green'};
        font-size: 24px;
        transition: transform 0.5s ease;
      ">
        ➤
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    className: 'drone-icon'
  });
};

function App() {
  const { drones, paths, redCount, selectedDroneId, updateDrones, selectDrone } = useDroneStore();
  const [mapBounds, setMapBounds] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  
  // تحويل Map إلى مصفوفة للتكرار
  const dronesArray = useMemo(() => Array.from(drones.values()), [drones]);
  const selectedDrone = selectedDroneId ? drones.get(selectedDroneId) : null;

  // تصفية الطائرات المرئية فقط
  const visibleDrones = useMemo(() => {
    if (!mapBounds) return dronesArray;
    
    return dronesArray.filter(drone => 
      mapBounds.contains([drone.lat, drone.lng])
    );
  }, [dronesArray, mapBounds]);

  // WebSocket connection - التصحيح هنا
 // بدلاً من useEffect الحالي للـ WebSocket
// WebSocket connection
useEffect(() => {
  setConnectionStatus("connecting");
  
  const socket = io("http://localhost:9013", { 
    transports: ["websocket", "polling"] 
  });

  socket.on("connect", () => {
    console.log("✅ Connected to backend via Socket.IO");
    setConnectionStatus("connected");
  });

  socket.on("message", (data) => {
    console.log("📨 Received data:", data);
    
    if (data && data.type === "FeatureCollection" && data.features) {
      updateDrones(data);
    } else {
      console.warn("⚠️ Unknown message format:", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket.IO disconnected");
    setConnectionStatus("disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("🔥 Socket.IO connection error:", err);
    setConnectionStatus("error");
  });

  return () => {
    socket.disconnect();
  };
}, [updateDrones]);

  return (
    <div className="app-container">
      {/* Dashboard */}
      <Dashboard connectionStatus={connectionStatus} />
      
      <div className="main-content">
        {/* Side Panel */}
        <SidePanel 
          drones={dronesArray} 
          selectedDroneId={selectedDroneId} 
          onSelectDrone={selectDrone} 
          redCount={redCount} 
        />
        
        {/* Map */}
        <MapContainer 
          center={[31.95, 35.91]} 
          zoom={10} 
          className="map-container"
        >
          <MapEvents onViewportChange={setMapBounds} />
          
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {visibleDrones.map(drone => (
            <React.Fragment key={drone.id}>
              <Marker
                position={[drone.lat, drone.lng]}
                icon={createDroneIcon(drone.yaw, drone.isRed)}
                eventHandlers={{
                  click: () => selectDrone(drone.id),
                }}
              >
                <Popup>
                  <div className="popup-content">
                    <p><strong>Registration:</strong> {drone.registration}</p>
                    <p><strong>Altitude:</strong> {drone.altitude} m</p>
                    <p><strong>Pilot:</strong> {drone.pilot}</p>
                    <p><strong>Organization:</strong> {drone.organization}</p>
                  </div>
                </Popup>
              </Marker>
              
              {paths.has(drone.id) && (
                <Polyline
                  positions={paths.get(drone.id)}
                  color={drone.isRed ? "red" : "green"}
                  weight={2}
                />
              )}
            </React.Fragment>
          ))}
          
          {selectedDrone && <FocusMap drone={selectedDrone} />}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;