// components/DroneIcon.js
import L from 'leaflet';

export const createDroneIcon = (yaw, isRed) => {
  // إنشاء أيقونة مخصصة مع اتجاه Yaw
  const iconHtml = `
    <div style="
      transform: rotate(${yaw}deg);
      color: ${isRed ? 'red' : 'green'};
      font-size: 24px;
    ">
      ➤
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    className: 'drone-icon'
  });
};