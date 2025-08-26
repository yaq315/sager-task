import React, { useEffect, useMemo, useCallback, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from 'leaflet';
import { useDroneStore } from "./store";
import SidePanel from "./components/SidePanel";
import Dashboard from "./components/Dashboard";
import "leaflet/dist/leaflet.css";
import "./App.css";

// إصلاح لأيقونات Leaflet الافتراضية
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
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

  // Debounced update for WebSocket messages
  const debouncedUpdate = useCallback(
    (() => {
      let timeoutId = null;
      return (data) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => updateDrones(data), 100);
      };
    })(),
    [updateDrones]
  );

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:9013");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "FeatureCollection" && data.features) {
          debouncedUpdate(data.features);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onopen = () => console.log("Connected to backend WebSocket");
    ws.onclose = () => console.log("WebSocket disconnected");
    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => ws.close();
  }, [debouncedUpdate]);

  return (
    <div className="app-container">
      {/* Dashboard */}
      <Dashboard />
      
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