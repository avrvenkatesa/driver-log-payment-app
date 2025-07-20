const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const { initializeDatabase, dbHelpers } = require('./database');
const { authenticateToken, loginDriver, registerDriver, sendSMSVerification, verifySMSCode } = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers and cache prevention
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Prevent caching of static files during development
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  
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
  const { identifier, password } = req.body; // identifier can be any alphanumeric string
  
  if (!identifier || !password) {
    return res.status(400).json({ error: 'phoneEmailPasswordRequired' });
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
  
  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'namePhoneRequired' });
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

// Driver shift routes (protected)
app.post('/api/driver/clock-in', authenticateToken, async (req, res) => {
  try {
    const { startOdometer } = req.body;
    const driverId = req.user.driverId;

    if (!startOdometer || startOdometer < 0) {
      return res.status(400).json({ error: 'validStartOdometerRequired' });
    }

    // Check if driver already has an active shift
    const activeShift = await dbHelpers.getActiveShift(driverId);
    if (activeShift) {
      return res.status(400).json({ error: 'alreadyActiveShift' });
    }

    // Check if start odometer is greater than or equal to previous end odometer
    const lastShift = await dbHelpers.getLastCompletedShift(driverId);
    if (lastShift && lastShift.end_odometer && startOdometer < lastShift.end_odometer) {
      return res.status(400).json({ 
        error: 'startOdometerMustBeGreaterOrEqual',
        data: { startOdometer, endOdometer: lastShift.end_odometer }
      });
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
      return res.status(400).json({ error: 'validEndOdometerRequired' });
    }

    // Get active shift
    const activeShift = await dbHelpers.getActiveShift(driverId);
    if (!activeShift) {
      return res.status(400).json({ error: 'noActiveShift' });
    }

    if (endOdometer < activeShift.start_odometer) {
      return res.status(400).json({ error: 'endOdometerLessThanStart' });
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

app.get('/api/driver/shifts-monthly/:year/:month', authenticateToken, async (req, res) => {
  try {
    const driverId = req.user.driverId;
    const { year, month } = req.params;
    
    const shifts = await dbHelpers.getDriverMonthlyShifts(driverId, year, month);
    res.json({ shifts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get monthly shifts' });
  }
});

// Admin API routes (protected)
app.get('/api/admin/drivers', authenticateToken, async (req, res) => {
  try {
    const drivers = await dbHelpers.getAllDrivers();
    res.json({ drivers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get drivers' });
  }
});

app.get('/api/admin/shifts', authenticateToken, async (req, res) => {
  try {
    const { filter = 'today' } = req.query;
    const result = await dbHelpers.getShiftsWithAnalytics(filter);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get shifts analytics' });
  }
});

app.get('/api/admin/reports/monthly', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const report = await dbHelpers.getMonthlyReport(year, month);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate monthly report' });
  }
});

app.get('/api/admin/driver/:driverId', authenticateToken, async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await dbHelpers.getDriverDetails(driverId);
    res.json({ driver });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get driver details' });
  }
});

// Payroll API routes (protected)
app.get('/api/admin/payroll/:year/:month', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.params;
    const payrollSummary = await dbHelpers.getPayrollSummary(year, month);
    res.json({ payrollSummary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate payroll summary' });
  }
});

app.get('/api/admin/payroll/driver/:driverId/:year/:month', authenticateToken, async (req, res) => {
  try {
    const { driverId, year, month } = req.params;
    const payroll = await dbHelpers.calculateDriverPayroll(driverId, year, month);
    res.json({ payroll });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate driver payroll' });
  }
});

app.get('/api/driver/payroll/:year/:month', authenticateToken, async (req, res) => {
  try {
    const driverId = req.user.driverId;
    const { year, month } = req.params;
    const payroll = await dbHelpers.calculateDriverPayroll(driverId, year, month);
    res.json({ payroll });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate payroll' });
  }
});

// Create test data for July 2025 (protected route)
app.post('/api/driver/create-test-data', authenticateToken, async (req, res) => {
  try {
    const driverId = req.user.driverId;
    const shiftsCreated = await dbHelpers.createTestData(driverId);
    res.json({ 
      success: true, 
      message: `Created ${shiftsCreated} test shifts for July 2025`,
      shiftsCreated 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create test data' });
  }
});

// Admin: Generate configurable test data
app.post('/api/admin/generate-test-data', authenticateToken, async (req, res) => {
  try {
    const { driverId, startMonth, endMonth, monthlySalary, overtimeRate, fuelAllowance } = req.body;
    
    if (!driverId || !startMonth || !endMonth) {
      return res.status(400).json({ error: 'Driver ID, start month, and end month are required' });
    }

    const shiftsCreated = await dbHelpers.generateConfigurableTestData({
      driverId,
      startMonth,
      endMonth,
      monthlySalary: monthlySalary || 27000,
      overtimeRate: overtimeRate || 100,
      fuelAllowance: fuelAllowance || 33.30
    });

    res.json({ 
      success: true, 
      message: `Created ${shiftsCreated} test shifts`,
      shiftsCreated 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate test data' });
  }
});

// Admin: Clear test data
app.post('/api/admin/clear-test-data', authenticateToken, async (req, res) => {
  try {
    const shiftsDeleted = await dbHelpers.clearTestData();
    res.json({ 
      success: true, 
      message: `Cleared ${shiftsDeleted} test shifts`,
      shiftsDeleted 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear test data' });
  }
});

// Payroll configuration endpoints
app.get('/api/admin/payroll-config', authenticateToken, async (req, res) => {
  try {
    const currentConfig = await dbHelpers.getCurrentPayrollConfig();
    res.json({ config: currentConfig });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get payroll configuration' });
  }
});

app.post('/api/admin/payroll-config', authenticateToken, async (req, res) => {
  try {
    const { monthlySalary, overtimeRate, fuelAllowance, workingHours, notes } = req.body;
    
    if (!monthlySalary || !overtimeRate || !fuelAllowance) {
      return res.status(400).json({ error: 'Monthly salary, overtime rate, and fuel allowance are required' });
    }

    const configId = await dbHelpers.savePayrollConfig({
      monthlySalary,
      overtimeRate,
      fuelAllowance,
      workingHours,
      notes
    }, req.user.email || 'admin');

    res.json({ 
      success: true, 
      message: 'Payroll configuration saved successfully',
      configId 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save payroll configuration' });
  }
});

app.get('/api/admin/payroll-config-history', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await dbHelpers.getPayrollConfigHistory(limit);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get payroll configuration history' });
  }
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