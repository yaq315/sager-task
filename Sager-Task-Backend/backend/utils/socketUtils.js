const socketIO = require("socket.io");

exports.sio = (server) => {
  return socketIO(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"]
  });
};

exports.connection = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ Client ${socket.id} connected`);
    
    // إرسال بيانات الاختبار فور الاتصال
    socket.emit('message', generateData());
    
    const intervalId = setInterval(() => {
      const data = generateData();
      socket.emit('message', data);
      console.log("📡 Sending drone data");
    }, 2000);
    
    socket.on("disconnect", (reason) => {
      console.log(`❌ Client disconnected: ${reason}`);
      clearInterval(intervalId);
    });
  });
};

function generateData() {
  const lat = 31.94878648036645 + (Math.random() * 2 - 1) / 100;
  const lng = 35.93131881204147 + (Math.random() * 2 - 1) / 100;
  
  return {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "id": `drone-${Math.random().toString(36).substr(2, 9)}`,
          "serial": makeID(10),
          "registration": "SD-" + makeID(2), 
          "name": "Dji Mavic",
          "altitude": Math.floor(Math.random() * 100),
          "pilot": "Besher",
          "organization": "Sager Drone",
          "yaw": Math.floor(Math.random() * 360),
          "isRed": Math.random() > 0.7 // 30% chance red
        },
        "geometry": {
          "coordinates": [lng, lat], // GeoJSON format: [longitude, latitude]
          "type": "Point"
        }
      }
    ]
  };
}

function makeID(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}