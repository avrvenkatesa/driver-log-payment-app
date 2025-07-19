const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const { initializeDatabase, dbHelpers } = require('./database');
const { authenticateToken, loginDriver, registerDriver, sendSMSVerification, verifySMSCode } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    message: '🚗 Driver Log App Server is running!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or phone
  
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Phone/Email and password required' });
  }

  const result = await loginDriver(identifier, password);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(401).json({ error: result.error });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, phone, email, password } = req.body;
  
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone number required' });
  }

  // Handle empty email field
  const cleanEmail = email && email.trim() !== '' ? email : null;
  
  const result = await registerDriver(name, phone, cleanEmail, password);
  
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json({ error: result.error });
  }
});

// SMS verification routes
app.post('/api/auth/send-verification', async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ error: 'Phone number required' });
  }

  const result = await sendSMSVerification(phone);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json({ error: result.error });
  }
});

app.post('/api/auth/verify-phone', async (req, res) => {
  const { phone, code } = req.body;
  
  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone number and verification code required' });
  }

  const result = await verifySMSCode(phone, code);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Driver shift routes (protected)
app.post('/api/driver/clock-in', authenticateToken, async (req, res) => {
  try {
    const { startOdometer } = req.body;
    const driverId = req.user.driverId;

    if (!startOdometer || startOdometer < 0) {
      return res.status(400).json({ error: 'Valid starting odometer reading required' });
    }

    // Check if driver already has an active shift
    const activeShift = await dbHelpers.getActiveShift(driverId);
    if (activeShift) {
      return res.status(400).json({ error: 'You already have an active shift. Please clock out first.' });
    }

    const shiftId = await dbHelpers.clockIn(driverId, startOdometer);
    res.json({ 
      success: true, 
      message: 'Clocked in successfully',
      shiftId 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clock in' });
  }
});

app.post('/api/driver/clock-out', authenticateToken, async (req, res) => {
  try {
    const { endOdometer } = req.body;
    const driverId = req.user.driverId;

    if (!endOdometer || endOdometer < 0) {
      return res.status(400).json({ error: 'Valid ending odometer reading required' });
    }

    // Get active shift
    const activeShift = await dbHelpers.getActiveShift(driverId);
    if (!activeShift) {
      return res.status(400).json({ error: 'No active shift found. Please clock in first.' });
    }

    if (endOdometer < activeShift.start_odometer) {
      return res.status(400).json({ error: 'End odometer cannot be less than start odometer' });
    }

    await dbHelpers.clockOut(activeShift.id, endOdometer);
    res.json({ 
      success: true, 
      message: 'Clocked out successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clock out' });
  }
});

app.get('/api/driver/status', authenticateToken, async (req, res) => {
  try {
    const driverId = req.user.driverId;
    const activeShift = await dbHelpers.getActiveShift(driverId);
    
    res.json({
      hasActiveShift: !!activeShift,
      activeShift: activeShift || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get driver status' });
  }
});

app.get('/api/driver/shifts/:date?', authenticateToken, async (req, res) => {
  try {
    const driverId = req.user.driverId;
    const date = req.params.date || new Date().toISOString().split('T')[0];
    
    const shifts = await dbHelpers.getDriverShifts(driverId, date);
    res.json({ shifts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get shifts' });
  }
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

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚗 Driver Log & Payment App running on port ${PORT}`);
      console.log(`📱 Frontend: http://0.0.0.0:${PORT}`);
      console.log(`🔌 API: http://0.0.0.0:${PORT}/api/health`);
      console.log(`💾 Database: SQLite initialized successfully`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();