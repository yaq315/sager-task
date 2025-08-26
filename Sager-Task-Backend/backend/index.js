const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const express = require("express");
const app = express();

// حاول استيراد socketUtils بشكل آمن
let socketUtils;
try {
  socketUtils = require("./utils/socketUtils");
  console.log("✅ socketUtils loaded successfully");
} catch (error) {
  console.warn("⚠️ socketUtils not found, running without Socket.IO");
  socketUtils = null;
}

const server = http.createServer(app);

// تهيئة Socket.io فقط إذا كان موجوداً
let io;
if (socketUtils) {
  try {
    io = socketUtils.sio(server);
    socketUtils.connection(io);
    console.log("✅ Socket.IO initialized");
  } catch (error) {
    console.error("❌ Socket.IO error:", error.message);
  }
}

// إعداد CORS مبسط للتجربة
app.use(cors({
  origin: "*", // غير إلى * للتجربة
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// route للصفحة الرئيسية
app.get("/", (req, res) => {
  console.log("✅ GET / request received");
  res.json({
    message: "🚀 Drone Tracking Server is Running",
    version: "1.0.0",
    endpoints: [
      "/api/health",
      "/api/drones"
    ],
    socketio: !!socketUtils,
    status: "active"
  });
});

// route للتحقق من صحة الخادم
app.get("/api/health", (req, res) => {
  console.log("✅ GET /api/health request received");
  res.json({ 
    status: "OK", 
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// route للدrones
app.get("/api/drones", (req, res) => {
  console.log("✅ GET /api/drones request received");
  res.json({
    count: 1,
    drones: [
      {
        id: "test-drone-1",
        registration: "SD-AB",
        lat: 31.9487,
        lng: 35.9313,
        altitude: 100,
        status: "active",
        lastUpdate: new Date().toISOString()
      }
    ]
  });
});

// معالجة جميع الطلبات غير المعرفة
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: "Route not found",
    path: req.url,
    method: req.method,
    availableRoutes: ["/", "/api/health", "/api/drones"]
  });
});

// معالجة أخطاء السيرفر
server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  console.error('Error code:', error.code);
  if (error.code === 'EADDRINUSE') {
    console.log('💡 Port is already in use. Try a different port.');
  }
});

// معالجة الأخطاء غير المعالجة
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  console.error('Stack:', err.stack);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// LISTEN - الجزء الوحيد بدون تكرار
const port = process.env.PORT || 9013;

server.listen(port, '127.0.0.1', () => {
  console.log(`✅ App running on port ${port}...`);
  console.log(`🌐 Local URL: http://localhost:${port}`);
  console.log(`🌐 Network URL: http://127.0.0.1:${port}`);
  console.log(`⏹️  Press Ctrl+C to stop`);
  console.log(`📊 Server started at: ${new Date().toISOString()}`);
  
  // 🔥 منع process من الخروج تلقائياً
  let heartbeatCount = 0;
  const heartbeat = setInterval(() => {
    heartbeatCount++;
    console.log(`💓 Server heartbeat #${heartbeatCount} - ${new Date().toISOString()}`);
  }, 3000);

  // معالجة إغلاق السيرفر
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    clearInterval(heartbeat);
    server.close(() => {
      console.log('✅ Server stopped gracefully');
      process.exit(0);
    });
  });
});