// store.js
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

    newDronesData.forEach(droneData => {
      const id = droneData.properties.serial;
      const registration = droneData.properties.registration;
      const isRed = !registration.startsWith('B');
      
      if (isRed) redCount++;

      // تحديث أو إضافة الطائرة الجديدة
      newDrones.set(id, {
        id,
        registration,
        lat: droneData.geometry.coordinates[1],
        lng: droneData.geometry.coordinates[0],
        altitude: droneData.properties.altitude,
        yaw: droneData.properties.yaw,
        pilot: droneData.properties.pilot,
        organization: droneData.properties.organization,
        isRed
      });

      // تحديث المسار
      if (newPaths.has(id)) {
        const existingPath = newPaths.get(id);
        existingPath.push([droneData.geometry.coordinates[1], droneData.geometry.coordinates[0]]);
        newPaths.set(id, existingPath);
      } else {
        newPaths.set(id, [[droneData.geometry.coordinates[1], droneData.geometry.coordinates[0]]]);
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