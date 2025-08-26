// components/VirtualizedList.js
import React from 'react';
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ drones, selectedDroneId, onSelectDrone, height }) => {
  const Row = ({ index, style }) => {
    const drone = drones[index];
    
    return (
      <div
        style={style}
        onClick={() => onSelectDrone(drone.id)}
        className={`
          drone-item 
          ${drone.id === selectedDroneId ? 'selected' : ''}
          ${drone.isRed ? 'red' : 'green'}
        `}
      >
        <div className="drone-registration">{drone.registration}</div>
        <div className="drone-details">
          Alt: {drone.altitude}m • {drone.pilot}
        </div>
      </div>
    );
  };

  return (
    <List
      height={height}
      itemCount={drones.length}
      itemSize={70}
      width="100%"
    >
      {Row}
    </List>
  );
};

export default VirtualizedList;