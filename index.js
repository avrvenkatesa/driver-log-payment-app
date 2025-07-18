const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    message: '🚛 Driver Log App Server is running!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API route for future driver operations
app.get('/api/drivers', (req, res) => {
  res.json({ message: 'Driver endpoints coming soon!' });
});

// API route for future admin operations  
app.get('/api/admin', (req, res) => {
  res.json({ message: 'Admin endpoints coming soon!' });
});

// Serve the main frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404s
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚛 Driver Log & Payment App running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api/health`);
});