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
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

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

// Admin: Update driver status (activate/deactivate)
app.put('/api/admin/driver/:driverId/status', authenticateToken, async (req, res) => {
  try {
    const { driverId } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active must be a boolean value' });
    }

    const changes = await dbHelpers.updateDriverStatus(driverId, is_active);
    
    if (changes === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({ 
      success: true, 
      message: `Driver ${is_active ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update driver status' });
  }
});

// Admin: Get monthly shift data for editing
app.get('/api/admin/shifts/monthly/:driverId/:year/:month', authenticateToken, async (req, res) => {
  try {
    const { driverId, year, month } = req.params;
    const monthlyData = await dbHelpers.getMonthlyShiftData(driverId, year, month);
    res.json({ monthlyData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get monthly shift data' });
  }
});

// Admin: Update or create shift entry
app.put('/api/admin/shifts/:shiftId?', authenticateToken, async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { driverId, date, startTime, endTime, startOdometer, endOdometer } = req.body;

    if (!driverId || !date || !startTime || !startOdometer) {
      return res.status(400).json({ error: 'Driver ID, date, start time, and start odometer are required' });
    }

    let result;
    if (shiftId && shiftId !== 'new') {
      // Update existing shift
      result = await dbHelpers.updateShiftEntry(shiftId, {
        startTime,
        endTime,
        startOdometer,
        endOdometer
      });
    } else {
      // Create new shift
      result = await dbHelpers.createShiftEntry(driverId, date, {
        startTime,
        endTime,
        startOdometer,
        endOdometer
      });
    }

    res.json({ 
      success: true, 
      message: shiftId && shiftId !== 'new' ? 'Shift updated successfully' : 'Shift created successfully',
      shiftId: result
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save shift data' });
  }
});

// Admin: Delete shift entry
app.delete('/api/admin/shifts/:shiftId', authenticateToken, async (req, res) => {
  try {
    const { shiftId } = req.params;
    const changes = await dbHelpers.deleteShiftEntry(shiftId);
    
    if (changes === 0) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    res.json({ 
      success: true, 
      message: 'Shift deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete shift' });
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

app.get('/api/admin/config-history', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await dbHelpers.getPayrollConfigHistory(limit);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get payroll configuration history' });
  }
});

app.get('/api/admin/config', authenticateToken, async (req, res) => {
  try {
    const config = await dbHelpers.getCurrentPayrollConfig();
    res.json({
      monthlySalary: config.monthly_salary || 27000,
      overtimeRate: config.overtime_rate || 100,
      fuelAllowance: config.fuel_allowance || 33.30,
      workingHours: config.working_hours || 8
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get current configuration' });
  }
});

// Leave Management API routes

// Driver: Submit leave request
app.post('/api/driver/leave-request', authenticateToken, async (req, res) => {
  try {
    const { leaveDate, reason, leaveType } = req.body;
    const driverId = req.user.driverId;

    console.log('Leave request received:', { driverId, leaveDate, reason, leaveType });

    if (!leaveDate || !reason) {
      console.log('Missing required fields:', { leaveDate: !!leaveDate, reason: !!reason });
      return res.status(400).json({ error: 'Leave date and reason are required' });
    }

    // Check if leave request already exists for this date
    const existingRequest = await new Promise((resolve, reject) => {
      const { db } = require('./database');
      db.get(
        'SELECT * FROM leave_requests WHERE driver_id = ? AND leave_date = ?',
        [driverId, leaveDate],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingRequest) {
      console.log('Duplicate leave request detected for date:', leaveDate);
      return res.status(400).json({ error: 'Leave request already exists for this date' });
    }

    const leaveId = await dbHelpers.submitLeaveRequest(driverId, leaveDate, reason, leaveType || 'annual');
    console.log('Leave request created successfully with ID:', leaveId);
    
    res.json({ 
      success: true, 
      message: 'Leave request submitted successfully',
      leaveId 
    });
  } catch (error) {
    console.error('Leave request submission error:', error);
    res.status(500).json({ error: 'Failed to submit leave request', details: error.message });
  }
});

// Driver: Get own leave requests
app.get('/api/driver/leave-requests/:year?', authenticateToken, async (req, res) => {
  try {
    const driverId = req.user.driverId;
    const year = req.params.year || new Date().getFullYear();
    
    const leaveRequests = await dbHelpers.getDriverLeaveRequests(driverId, year);
    const annualLeaveCount = await dbHelpers.getAnnualLeaveCount(driverId, year);
    
    res.json({ 
      leaveRequests,
      annualLeaveCount,
      remainingLeaves: Math.max(0, 12 - annualLeaveCount)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get leave requests' });
  }
});

// Admin: Get all leave requests
app.get('/api/admin/leave-requests', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const leaveRequests = await dbHelpers.getAllLeaveRequests(status);
    res.json({ leaveRequests });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get leave requests' });
  }
});

// Admin: Update leave request status
app.put('/api/admin/leave-request/:leaveId', authenticateToken, async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, notes } = req.body;
    const approvedBy = req.user.email || req.user.phone || 'admin';

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const changes = await dbHelpers.updateLeaveRequestStatus(leaveId, status, approvedBy, notes);
    
    if (changes === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    res.json({ 
      success: true, 
      message: `Leave request ${status} successfully` 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update leave request' });
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
      console.log(`🌐 Server accessible at: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();