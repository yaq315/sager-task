// components/Dashboard.js
import React from "react";
import { useDroneStore } from "../store";

const Dashboard = () => {
  const { drones, redCount } = useDroneStore();
  const totalDrones = drones.size;
  const greenCount = totalDrones - redCount;
  
  return (
    <div className="dashboard">
      <div className="dashboard-item">
        <h3>Total Drones</h3>
        <p className="dashboard-value">{totalDrones}</p>
      </div>
      <div className="dashboard-item">
        <h3>Green Drones</h3>
        <p className="dashboard-value green-text">{greenCount}</p>
      </div>
      <div className="dashboard-item">
        <h3>Red Drones</h3>
        <p className="dashboard-value red-text">{redCount}</p>
      </div>
      <div className="dashboard-item">
        <h3>Last Update</h3>
        <p className="dashboard-time">
          {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;