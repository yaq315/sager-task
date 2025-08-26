import { create } from 'zustand';

export const useDroneStore = create((set, get) => ({
  drones: new Map(),
  paths: new Map(),
  redCount: 0,
  selectedDroneId: null,

  updateDrones: (newDronesData) => set((state) => {
    const newDrones = new Map(state.drones);
    const newPaths = new Map(state.paths);
    let redCount = 0;

    console.log("📊 Processing drones data:", newDronesData);

    newDronesData.features.forEach(droneFeature => {
      const properties = droneFeature.properties;
      const geometry = droneFeature.geometry;
      
      const id = properties.id || properties.serial;
      const isRed = properties.isRed || !properties.registration.startsWith('B');
      
      if (isRed) redCount++;

      // تحديث بيانات الطائرة
      const drone = {
        id,
        registration: properties.registration,
        lat: geometry.coordinates[1], // latitude
        lng: geometry.coordinates[0], // longitude
        altitude: properties.altitude,
        yaw: properties.yaw,
        pilot: properties.pilot,
        organization: properties.organization,
        isRed
      };

      newDrones.set(id, drone);

      // تحديث المسار
      const newPosition = [geometry.coordinates[1], geometry.coordinates[0]];
      
      if (newPaths.has(id)) {
        const existingPath = newPaths.get(id);
        if (existingPath.length > 50) existingPath.shift(); // limit path length
        existingPath.push(newPosition);
        newPaths.set(id, existingPath);
      } else {
        newPaths.set(id, [newPosition]);
      }
    });

    return { 
      drones: newDrones, 
      paths: newPaths, 
      redCount 
    };
  }),

  selectDrone: (droneId) => set({ selectedDroneId: droneId }),
}));