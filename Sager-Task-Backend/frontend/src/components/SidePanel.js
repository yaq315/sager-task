import React, { useMemo } from "react";
import VirtualizedList from "./VirtualizedList";

const SidePanel = ({ drones, selectedDroneId, onSelectDrone, redCount }) => {
  const sortedDrones = useMemo(() => {
    return [...drones].sort((a, b) => a.registration.localeCompare(b.registration));
  }, [drones]);

  return (
    <div className="side-panel">
      <h2>Drones List</h2>
      
      {drones.length === 0 ? (
        <div className="no-drones">No drones in the sky</div>
      ) : (
        <VirtualizedList 
          drones={sortedDrones}
          selectedDroneId={selectedDroneId}
          onSelectDrone={onSelectDrone}
          height={500}
        />
      )}
      
      <div className="red-count">
        Red Drones Count: {redCount}
      </div>
    </div>
  );
};

export default SidePanel;