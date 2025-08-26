console.log('🔄 Starting final server...');

const http = require('http');
const express = require('express');
const cors = require('cors');
const readline = require('readline');

const app = express();
app.use(cors());

// Routes
app.get('/', (req, res) => {
  console.log('✅ GET / request received');
  res.json({ 
    message: '🚀 Drone Server Working!',
    status: 'OK'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);
const PORT = 9013;

server.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Server running on http://127.0.0.1:${PORT}`);
  console.log('⏹️ Press Enter to stop server...');
});

// إبقاء Process مفتوح
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  if (input === 'stop') {
    console.log('🛑 Stopping server...');
    server.close();
    process.exit(0);
  }
});

// منع الإغلاق
setInterval(() => {
  console.log('💓 Server heartbeat:', new Date().toISOString());
}, 5000);

server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
});