const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'driver_logs.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Drivers table
      db.run(`CREATE TABLE IF NOT EXISTS drivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        verification_code TEXT,
        verification_expires_at DATETIME,
        is_phone_verified BOOLEAN DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Shifts table
      db.run(`CREATE TABLE IF NOT EXISTS shifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        driver_id INTEGER NOT NULL,
        clock_in_time DATETIME NOT NULL,
        clock_out_time DATETIME,
        start_odometer INTEGER NOT NULL,
        end_odometer INTEGER,
        total_distance INTEGER,
        shift_duration_minutes INTEGER,
        is_overtime BOOLEAN DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (driver_id) REFERENCES drivers (id)
      )`);

      // Payroll configuration history
      db.run(`CREATE TABLE IF NOT EXISTS payroll_config_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monthly_salary REAL NOT NULL,
        overtime_rate REAL NOT NULL,
        fuel_allowance REAL NOT NULL,
        working_hours REAL DEFAULT 8,
        changed_by TEXT,
        changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
      )`);

      // Leave requests table
      db.run(`CREATE TABLE IF NOT EXISTS leave_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        driver_id INTEGER NOT NULL,
        leave_date DATE NOT NULL,
        leave_type TEXT DEFAULT 'annual',
        reason TEXT,
        status TEXT DEFAULT 'pending',
        requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approved_by TEXT,
        approved_at DATETIME,
        notes TEXT,
        FOREIGN KEY (driver_id) REFERENCES drivers (id),
        UNIQUE(driver_id, leave_date)
      )`);

      // Audit log for changes
      db.run(`CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        old_values TEXT,
        new_values TEXT,
        changed_by TEXT,
        changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, async (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database tables initialized successfully');

          // Create test user if it doesn't exist
          try {
            const testUser = await dbHelpers.getDriverByPhone('+1234567890');
            if (!testUser) {
              const bcrypt = require('bcryptjs');
              const testPassword = await bcrypt.hash('password123', 10);
              await dbHelpers.createDriver({
                name: 'Test Driver',
                email: 'test@driver.com',
                password_hash: testPassword,
                phone: '+1234567890'
              });
              // Mark test user as verified
              await new Promise((resolve, reject) => {
                db.run('UPDATE drivers SET is_phone_verified = 1 WHERE phone = ?', ['+1234567890'], (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              });
              console.log('🧪 Test driver account created: +1234567890 / password123');
            }
          } catch (error) {
            console.log('Note: Could not create test user:', error.message);
          }

          resolve();
        }
      });
    });
  });
}

// Helper functions for database operations
const dbHelpers = {
  // Get driver by email
  getDriverByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM drivers WHERE email = ? AND is_active = 1', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Get driver by phone
  getDriverByPhone: (phone) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM drivers WHERE phone = ? AND is_active = 1', [phone], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Get driver by identifier (simplified for single driver app)
  getDriverByIdentifier: (identifier) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM drivers WHERE (phone = ? OR email = ?) AND is_active = 1', [identifier, identifier], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Update verification code
  updateVerificationCode: (phone, code) => {
    return new Promise((resolve, reject) => {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      db.run(
        'UPDATE drivers SET verification_code = ?, verification_expires_at = ? WHERE phone = ?',
        [code, expiresAt.toISOString(), phone],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  },

  // Verify phone number
  verifyPhoneNumber: (phone, code) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM drivers WHERE phone = ? AND verification_code = ? AND verification_expires_at > CURRENT_TIMESTAMP',
        [phone, code],
        (err, row) => {
          if (err) reject(err);
          else if (row) {
            // Mark as verified and clear verification code
            db.run(
              'UPDATE drivers SET is_phone_verified = 1, verification_code = NULL, verification_expires_at = NULL WHERE id = ?',
              [row.id],
              (updateErr) => {
                if (updateErr) reject(updateErr);
                else resolve(row);
              }
            );
          } else {
            resolve(null);
          }
        }
      );
    });
  },

  // Create new driver
  createDriver: (driverData) => {
    return new Promise((resolve, reject) => {
      const { name, email, password_hash, phone } = driverData;
      db.run(
        'INSERT INTO drivers (name, email, password_hash, phone, is_phone_verified) VALUES (?, ?, ?, ?, 1)',
        [name, email, password_hash, phone],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  // Get active shift for driver
  getActiveShift: (driverId) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM shifts WHERE driver_id = ? AND clock_out_time IS NULL ORDER BY clock_in_time DESC LIMIT 1',
        [driverId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  },

  // Clock in
  clockIn: (driverId, startOdometer) => {
    return new Promise((resolve, reject) => {
      // Generate IST timestamp
      const istTime = new Date().toLocaleString('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(',', '');

      db.run(
        'INSERT INTO shifts (driver_id, clock_in_time, start_odometer) VALUES (?, ?, ?)',
        [driverId, istTime, startOdometer],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  // Clock out
  clockOut: (shiftId, endOdometer) => {
    return new Promise((resolve, reject) => {
      // Generate IST timestamp
      const istTime = new Date().toLocaleString('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(',', '');

      // First get the clock_in_time to calculate duration
      db.get('SELECT clock_in_time FROM shifts WHERE id = ?', [shiftId], (err, shift) => {
        if (err) {
          reject(err);
          return;
        }

        // Calculate duration between IST times
        const clockInTime = new Date(shift.clock_in_time);
        const clockOutTime = new Date(istTime);
        const durationMinutes = Math.round((clockOutTime - clockInTime) / (1000 * 60));

        db.run(
          `UPDATE shifts 
           SET clock_out_time = ?, 
               end_odometer = ?,
               total_distance = ? - start_odometer,
               shift_duration_minutes = ?,
               updated_at = ?
           WHERE id = ?`,
          [istTime, endOdometer, endOdometer, durationMinutes, istTime, shiftId],
          function(err) {
            if (err) reject(err);
            else resolve(this.changes);
          }
        );
      });
    });
  },

  // Get driver's shifts for a specific date
  getDriverShifts: (driverId, date) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM shifts 
         WHERE driver_id = ? 
         AND date(clock_in_time) = date(?)
         ORDER BY clock_in_time DESC`,
        [driverId, date],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  // Get last completed shift for odometer validation
  getLastCompletedShift: (driverId) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM shifts 
         WHERE driver_id = ? 
         AND clock_out_time IS NOT NULL 
         AND end_odometer IS NOT NULL
         ORDER BY clock_out_time DESC 
         LIMIT 1`,
        [driverId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  },

  // Get driver's shifts for a specific month
  getDriverMonthlyShifts: (driverId, year, month) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM shifts 
         WHERE driver_id = ? 
         AND strftime('%Y', clock_in_time) = ?
         AND strftime('%m', clock_in_time) = ?
         ORDER BY clock_in_time DESC`,
        [driverId, year, month.padStart(2, '0')],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  // Get all drivers for admin
  getAllDrivers: () => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM drivers ORDER BY created_at DESC',
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  // Get driver details with recent shifts
  getDriverDetails: (driverId) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM drivers WHERE id = ?',
        [driverId],
        async (err, driver) => {
          if (err) reject(err);
          else {
            try {
              // Get recent shifts for this driver
              const shifts = await dbHelpers.getDriverShifts(driverId, new Date().toISOString().split('T')[0]);
              resolve({ ...driver, recentShifts: shifts });
            } catch (error) {
              resolve(driver);
            }
          }
        }
      );
    });
  },

    updateDriverStatus: (driverId, isActive) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE drivers SET is_active = ? WHERE id = ?',
          [isActive ? 1 : 0, driverId],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve(this.changes);
            }
          }
        );
      });
    },

  // Get shifts with analytics for admin
  getShiftsWithAnalytics: (filter) => {
    return new Promise((resolve, reject) => {
      let dateCondition = '';
      const today = new Date().toISOString().split('T')[0];

      switch (filter) {
        case 'today':
          dateCondition = `AND date(s.clock_in_time) = date('${today}')`;
          break;
        case 'week':
          dateCondition = `AND date(s.clock_in_time) >= date('${today}', '-7 days')`;
          break;
        case 'month':
          dateCondition = `AND date(s.clock_in_time) >= date('${today}', 'start of month')`;
          break;
        default:
          dateCondition = '';
      }

      // First get the shifts
      db.all(
        `SELECT s.*, d.name as driver_name 
         FROM shifts s 
         JOIN drivers d ON s.driver_id = d.id 
         WHERE 1=1 ${dateCondition}
         ORDER BY s.clock_in_time DESC`,
        [],
        (err, shifts) => {
          if (err) reject(err);
          else {
            // Calculate summary
            const summary = {
              totalShifts: shifts.length,
              totalDistance: shifts.reduce((sum, shift) => sum + (shift.total_distance || 0), 0),
              totalMinutes: shifts.reduce((sum, shift) => sum + (shift.shift_duration_minutes || 0), 0),
              activeDrivers: new Set(shifts.map(shift => shift.driver_id)).size
            };

            resolve({ shifts, summary });
          }
        }
      );
    });
  },

  // Get monthly report data
  getMonthlyReport: (year, month) => {
    return new Promise((resolve, reject) => {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

      db.all(
        `SELECT 
           date(clock_in_time) as shift_date,
           COUNT(*) as shifts_count,
           SUM(total_distance) as total_distance,
           SUM(shift_duration_minutes) as total_minutes
         FROM shifts 
         WHERE date(clock_in_time) BETWEEN ? AND ?
         AND clock_out_time IS NOT NULL
         GROUP BY date(clock_in_time)
         ORDER BY shift_date`,
        [startDate, endDate],
        (err, dailyData) => {
          if (err) reject(err);
          else {
            // Calculate overall summary
            const summary = {
              totalShifts: dailyData.reduce((sum, day) => sum + day.shifts_count, 0),
              totalDistance: dailyData.reduce((sum, day) => sum + (day.total_distance || 0), 0),
              totalMinutes: dailyData.reduce((sum, day) => sum + (day.total_minutes || 0), 0),
              avgShiftMinutes: 0
            };

            if (summary.totalShifts > 0) {
              summary.avgShiftMinutes = summary.totalMinutes / summary.totalShifts;
            }

            // Format daily breakdown
            const dailyBreakdown = dailyData.map(day => ({
              date: day.shift_date,
              shifts: day.shifts_count,
              distance: day.total_distance || 0,
              minutes: day.total_minutes || 0
            }));

            resolve({
              month,
              year,
              summary,
              dailyBreakdown
            });
          }
        }
      );
    });
  },

  // Calculate payroll for a driver for a specific month
  calculateDriverPayroll: async (driverId, year, month) => {
    return new Promise(async (resolve, reject) => {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

      try {
        // Get shifts for the month
        const shifts = await new Promise((resolve, reject) => {
          db.all(
            `SELECT * FROM shifts 
             WHERE driver_id = ? 
             AND date(clock_in_time) BETWEEN ? AND ?
             AND clock_out_time IS NOT NULL
             ORDER BY clock_in_time`,
            [driverId, startDate, endDate],
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            }
          );
        });

        // Get approved leaves for the month
        const monthLeaves = await dbHelpers.getApprovedLeaves(driverId, year, month);

        // Get annual leave count for the year
        const annualLeaveCount = await dbHelpers.getAnnualLeaveCount(driverId, year);

        // Payroll configuration
        const BASE_SALARY = 27000; // ₹27,000 per month
        const OVERTIME_RATE = 100; // ₹100 per hour
        const FUEL_ALLOWANCE_PER_DAY = 33.30; // ₹33.30 per day worked

          let totalOvertimeMinutes = 0;
          let workedDays = new Set();
          let totalRegularMinutes = 0;
          let totalDistance = 0;

          shifts.forEach(shift => {
            const clockInTime = new Date(shift.clock_in_time);
            const clockOutTime = new Date(shift.clock_out_time);
            const dateKey = shift.clock_in_time.split(' ')[0]; // Get date part

            workedDays.add(dateKey);
            totalDistance += shift.total_distance || 0;

            // Calculate overtime based on time and day
            const shiftDuration = shift.shift_duration_minutes || 0;
            let overtimeMinutes = 0;
            let regularMinutes = shiftDuration;

            // Check if it's Sunday (overtime)
            const dayOfWeek = clockInTime.getDay();
            if (dayOfWeek === 0) { // Sunday
              overtimeMinutes += shiftDuration;
              regularMinutes = 0;
            } else {
              // Check for early morning overtime (before 8 AM)
              const startHour = clockInTime.getHours();
              if (startHour < 8) {
                const earlyMinutes = (8 - startHour) * 60 - clockInTime.getMinutes();
                overtimeMinutes += Math.min(earlyMinutes, shiftDuration);
              }

              // Check for late evening overtime (after 8 PM)
              const endHour = clockOutTime.getHours();
              if (endHour >= 20 || (endHour === 19 && clockOutTime.getMinutes() > 0)) {
                const lateStart = new Date(clockOutTime);
                lateStart.setHours(20, 0, 0, 0);
                if (clockOutTime > lateStart) {
                  const lateMinutes = (clockOutTime - lateStart) / (1000 * 60);
                  overtimeMinutes += lateMinutes;
                }
              }

              regularMinutes = Math.max(0, shiftDuration - overtimeMinutes);
            }

            totalOvertimeMinutes += overtimeMinutes;
            totalRegularMinutes += regularMinutes;
          });

          // Calculate leave impact
        const totalLeaveDays = monthLeaves.length;
        const allowableLeavesUsed = Math.min(annualLeaveCount, 12);
        const unpaidLeavesThisMonth = monthLeaves.filter(leave => {
          // Calculate if this leave falls into unpaid category
          const leaveDate = new Date(leave.leave_date);
          const leavesBeforeThis = monthLeaves.filter(l => new Date(l.leave_date) < leaveDate).length;
          const totalLeavesBefore = annualLeaveCount - totalLeaveDays + leavesBeforeThis;
          return totalLeavesBefore >= 12;
        }).length;

        const paidLeavesThisMonth = totalLeaveDays - unpaidLeavesThisMonth;

        // Calculate final amounts
        const overtimeHours = totalOvertimeMinutes / 60;
        const regularHours = totalRegularMinutes / 60;
        const daysWorked = workedDays.size;

        const overtimePay = overtimeHours * OVERTIME_RATE;

        // Fuel allowance: No fuel allowance for any leave days
        const fuelAllowance = daysWorked * FUEL_ALLOWANCE_PER_DAY;

        // Salary deductions for unpaid leaves
        const dailySalary = BASE_SALARY / 30; // Assuming 30 days per month
        const unpaidLeaveDeduction = unpaidLeavesThisMonth * dailySalary;
        const adjustedBaseSalary = BASE_SALARY - unpaidLeaveDeduction;

        const grossPay = adjustedBaseSalary + overtimePay + fuelAllowance;

        const payrollData = {
          driverId,
          month: parseInt(month),
          year: parseInt(year),
          shifts: shifts.length,
          daysWorked,
          totalDistance,
          regularHours: Math.round(regularHours * 100) / 100,
          overtimeHours: Math.round(overtimeHours * 100) / 100,
          baseSalary: BASE_SALARY,
          adjustedBaseSalary: Math.round(adjustedBaseSalary * 100) / 100,
          overtimePay: Math.round(overtimePay * 100) / 100,
          fuelAllowance: Math.round(fuelAllowance * 100) / 100,
          grossPay: Math.round(grossPay * 100) / 100,
          // Leave information
          totalLeaveDays,
          paidLeavesThisMonth,
          unpaidLeavesThisMonth,
          annualLeaveCount,
          allowableLeavesUsed,
          unpaidLeaveDeduction: Math.round(unpaidLeaveDeduction * 100) / 100,
          leaveDetails: monthLeaves,
          shiftsDetails: shifts
        };

        resolve(payrollData);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Get payroll summary for all drivers for a specific month
  getPayrollSummary: async (year, month) => {
    return new Promise(async (resolve, reject) => {
      try {
        const drivers = await dbHelpers.getAllDrivers();
        const payrollSummaries = [];

        for (const driver of drivers) {
          if (driver.is_active) {
            const payroll = await dbHelpers.calculateDriverPayroll(driver.id, year, month);
            payrollSummaries.push({
              driver: {
                id: driver.id,
                name: driver.name,
                phone: driver.phone
              },
              payroll
            });
          }
        }

        resolve(payrollSummaries);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Get YTD payroll summary for all drivers
  getYTDPayrollSummary: async (year) => {
    return new Promise(async (resolve, reject) => {
      try {
        const drivers = await dbHelpers.getAllDrivers();
        const payrollSummaries = [];

        for (const driver of drivers) {
          if (driver.is_active) {
            // Calculate YTD payroll by aggregating all months
            let ytdPayroll = {
              driverId: driver.id,
              year: parseInt(year),
              shifts: 0,
              daysWorked: 0,
              totalDistance: 0,
              regularHours: 0,
              overtimeHours: 0,
              baseSalary: 0,
              adjustedBaseSalary: 0,
              overtimePay: 0,
              fuelAllowance: 0,
              grossPay: 0,
              totalLeaveDays: 0,
              paidLeavesThisMonth: 0,
              unpaidLeavesThisMonth: 0,
              annualLeaveCount: 0,
              unpaidLeaveDeduction: 0
            };

            // Get data for all months up to current month
            const currentMonth = new Date().getMonth() + 1;
            const targetMonth = new Date().getFullYear() == year ? currentMonth : 12;

            for (let month = 1; month <= targetMonth; month++) {
              const monthlyPayroll = await dbHelpers.calculateDriverPayroll(driver.id, year, month);
              
              ytdPayroll.shifts += monthlyPayroll.shifts;
              ytdPayroll.daysWorked += monthlyPayroll.daysWorked;
              ytdPayroll.totalDistance += monthlyPayroll.totalDistance;
              ytdPayroll.regularHours += monthlyPayroll.regularHours;
              ytdPayroll.overtimeHours += monthlyPayroll.overtimeHours;
              ytdPayroll.baseSalary += monthlyPayroll.baseSalary;
              ytdPayroll.adjustedBaseSalary += monthlyPayroll.adjustedBaseSalary;
              ytdPayroll.overtimePay += monthlyPayroll.overtimePay;
              ytdPayroll.fuelAllowance += monthlyPayroll.fuelAllowance;
              ytdPayroll.grossPay += monthlyPayroll.grossPay;
              ytdPayroll.totalLeaveDays += monthlyPayroll.totalLeaveDays;
              ytdPayroll.paidLeavesThisMonth += monthlyPayroll.paidLeavesThisMonth;
              ytdPayroll.unpaidLeavesThisMonth += monthlyPayroll.unpaidLeavesThisMonth;
              ytdPayroll.unpaidLeaveDeduction += monthlyPayroll.unpaidLeaveDeduction;
            }

            // Get annual leave count
            ytdPayroll.annualLeaveCount = await dbHelpers.getAnnualLeaveCount(driver.id, year);

            // Round all monetary values
            ytdPayroll.regularHours = Math.round(ytdPayroll.regularHours * 100) / 100;
            ytdPayroll.overtimeHours = Math.round(ytdPayroll.overtimeHours * 100) / 100;
            ytdPayroll.baseSalary = Math.round(ytdPayroll.baseSalary * 100) / 100;
            ytdPayroll.adjustedBaseSalary = Math.round(ytdPayroll.adjustedBaseSalary * 100) / 100;
            ytdPayroll.overtimePay = Math.round(ytdPayroll.overtimePay * 100) / 100;
            ytdPayroll.fuelAllowance = Math.round(ytdPayroll.fuelAllowance * 100) / 100;
            ytdPayroll.grossPay = Math.round(ytdPayroll.grossPay * 100) / 100;
            ytdPayroll.unpaidLeaveDeduction = Math.round(ytdPayroll.unpaidLeaveDeduction * 100) / 100;

            payrollSummaries.push({
              driver: {
                id: driver.id,
                name: driver.name,
                phone: driver.phone
              },
              payroll: ytdPayroll
            });
          }
        }

        resolve(payrollSummaries);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Create test data for July 2025
  createTestData: async (driverId) => {
    return new Promise((resolve, reject) => {
      const testShifts = [
        // July 1, 2025
        { date: '2025-07-01', startTime: '06:00:00', endTime: '14:30:00', startOdo: 45000, endOdo: 45180 },
        // July 2, 2025
        { date: '2025-07-02', startTime: '07:15:00', endTime: '15:45:00', startOdo: 45180, endOdo: 45340 },
        // July 3, 2025
        { date: '2025-07-03', startTime: '06:30:00', endTime: '14:00:00', startOdo: 45340, endOdo: 45485 },
        // July 4, 2025
        { date: '2025-07-04', startTime: '08:00:00', endTime: '16:30:00', startOdo: 45485, endOdo: 45670 },
        // July 5, 2025
        { date: '2025-07-05', startTime: '06:45:00', endTime: '15:15:00', startOdo: 45670, endOdo: 45820 },
        // July 8, 2025 (skipping weekend)
        { date: '2025-07-08', startTime: '07:00:00', endTime: '15:30:00', startOdo: 45820, endOdo: 45995 },
        // July 9, 2025
        { date: '2025-07-09', startTime: '06:15:00', endTime: '14:45:00', startOdo: 45995, endOdo: 46140 },
        // July 10, 2025
        { date: '2025-07-10', startTime: '07:30:00', endTime: '16:00:00', startOdo: 46140, endOdo: 46320 },
        // July 11, 2025
        { date: '2025-07-11', startTime: '06:00:00', endTime: '14:30:00', startOdo: 46320, endOdo: 46475 },
        // July 12, 2025
        { date: '2025-07-12', startTime: '08:15:00', endTime: '16:45:00', startOdo: 46475, endOdo: 46650 },
        // July 15, 2025 (skipping weekend)
        { date: '2025-07-15', startTime: '06:30:00', endTime: '15:00:00', startOdo: 46650, endOdo: 46795 },
        // July 16, 2025
        { date: '2025-07-16', startTime: '07:45:00', endTime: '16:15:00', startOdo: 46795, endOdo: 46970 },
        // July 17, 2025
        { date: '2025-07-17', startTime: '06:00:00', endTime: '14:30:00', startOdo: 46970, endOdo: 47125 },
        // July 18, 2025
        { date: '2025-07-18', startTime: '07:00:00', endTime: '15:30:00', startOdo: 47125, endOdo: 47285 }
      ];

      let completed = 0;
      const total = testShifts.length;

      testShifts.forEach(shift => {
        const clockInTime = `${shift.date} ${shift.startTime}`;
        const clockOutTime = `${shift.date} ${shift.endTime}`;

        // Calculate duration
        const startTime = new Date(`${shift.date}T${shift.startTime}`);
        const endTime = new Date(`${shift.date}T${shift.endTime}`);
        const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
        const totalDistance = shift.endOdo - shift.startOdo;

        db.run(
          `INSERT INTO shifts (driver_id, clock_in_time, clock_out_time, start_odometer, end_odometer, total_distance, shift_duration_minutes, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')`,
          [driverId, clockInTime, clockOutTime, shift.startOdo, shift.endOdo, totalDistance, durationMinutes],
          function(err) {
            if (err) {
              console.error('Error creating test shift:', err);
            }
            completed++;
            if (completed === total) {
              resolve(completed);
            }
          }
        );
      });
    });
  },

  // Generate configurable test data for multiple months
  generateConfigurableTestData: async (config) => {
    return new Promise(async (resolve, reject) => {
      const { driverId, startMonth, endMonth, monthlySalary, overtimeRate, fuelAllowance } = config;

      try {
        // Get driver's last shift to continue odometer readings
        const lastShift = await dbHelpers.getLastCompletedShift(driverId);
        let currentOdometer = lastShift ? lastShift.end_odometer : 50000;

        const startDate = new Date(startMonth + '-01');
        const endDate = new Date(endMonth + '-01');
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of end month

        const testShifts = [];
        const currentDate = new Date(startDate);

        // Generate shifts for each weekday in the date range
        while (currentDate <= endDate) {
          const dayOfWeek = currentDate.getDay();

          // Skip weekends (Saturday = 6, Sunday = 0)
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const dateStr = currentDate.toISOString().split('T')[0];

            // Randomize shift times
            const startHours = Math.floor(Math.random() * 3) + 6; // 6-8 AM
            const startMinutes = Math.floor(Math.random() * 60);
            const shiftDuration = 8 + Math.floor(Math.random() * 2); // 8-9 hours

            const startTime = `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}:00`;

            const endDateTime = new Date(currentDate);
            endDateTime.setHours(startHours, startMinutes, 0, 0);
            endDateTime.setHours(endDateTime.getHours() + shiftDuration);

            const endTime = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}:00`;

            // Random distance between 120-200 km
            const distance = Math.floor(Math.random() * 80) + 120;
            const endOdometer = currentOdometer + distance;

            testShifts.push({
              date: dateStr,
              startTime,
              endTime,
              startOdo: currentOdometer,
              endOdo: endOdometer
            });

            currentOdometer = endOdometer;
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }

        let completed = 0;
        const total = testShifts.length;

        if (total === 0) {
          resolve(0);
          return;
        }

        testShifts.forEach(shift => {
          const clockInTime = `${shift.date} ${shift.startTime}`;
          const clockOutTime = `${shift.date} ${shift.endTime}`;

          // Calculate duration
          const startTime = new Date(`${shift.date}T${shift.startTime}`);
          const endTime = new Date(`${shift.date}T${shift.endTime}`);
          const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
          const totalDistance = shift.endOdo - shift.startOdo;

          db.run(
            `INSERT INTO shifts (driver_id, clock_in_time, clock_out_time, start_odometer, end_odometer, total_distance, shift_duration_minutes, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')`,
            [driverId, clockInTime, clockOutTime, shift.startOdo, shift.endOdo, totalDistance, durationMinutes],
            function(err) {
              if (err) {
                console.error('Error creating test shift:', err);
              }
              completed++;
              if (completed === total) {
                resolve(completed);
              }
            }
          );
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  // Clear test data
  clearTestData: async () => {
    return new Promise((resolve, reject) => {
      // First count how many shifts will be deleted
      db.get('SELECT COUNT(*) as count FROM shifts WHERE status = "completed"', [], (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        const shiftsCount = result.count;

        // Delete all completed shifts (test data)
        db.run('DELETE FROM shifts WHERE status = "completed"', [], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(shiftsCount);
          }
        });
      });
    });
  },

  // Save payroll configuration
  savePayrollConfig: (config, changedBy = 'system') => {
    return new Promise((resolve, reject) => {
      const { monthlySalary, overtimeRate, fuelAllowance, workingHours, notes } = config;
      db.run(
        `INSERT INTO payroll_config_history (monthly_salary, overtime_rate, fuel_allowance, working_hours, changed_by, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [monthlySalary, overtimeRate, fuelAllowance, workingHours || 8, changedBy, notes || ''],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  // Get current payroll configuration
  getCurrentPayrollConfig: () => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM payroll_config_history ORDER BY changed_at DESC LIMIT 1',
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || {
            monthly_salary: 27000,
            overtime_rate: 100,
            fuel_allowance: 33.30,
            working_hours: 8
          });
        }
      );
    });
  },

  // Get payroll configuration history
  getPayrollConfigHistory: (limit = 50) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM payroll_config_history ORDER BY changed_at DESC LIMIT ?',
        [limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  // Leave management functions
  // Submit leave request
  submitLeaveRequest: (driverId, leaveDate, reason, leaveType = 'annual') => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO leave_requests (driver_id, leave_date, reason, leave_type) VALUES (?, ?, ?, ?)',
        [driverId, leaveDate, reason, leaveType],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  // Get leave requests for driver
  getDriverLeaveRequests: (driverId, year) => {
    return new Promise((resolve, reject) => {
      const query = year 
        ? 'SELECT * FROM leave_requests WHERE driver_id = ? AND strftime("%Y", leave_date) = ? ORDER BY leave_date DESC'
        : 'SELECT * FROM leave_requests WHERE driver_id = ? ORDER BY leave_date DESC';
      const params = year ? [driverId, year.toString()] : [driverId];

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Get all leave requests for admin
  getAllLeaveRequests: (status = null) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT lr.*, d.name as driver_name, d.phone as driver_phone 
        FROM leave_requests lr 
        JOIN drivers d ON lr.driver_id = d.id
      `;
      let params = [];

      if (status) {
        query += ' WHERE lr.status = ?';
        params.push(status);
      }

      query += ' ORDER BY lr.requested_at DESC';

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Update leave request status
  updateLeaveRequestStatus: (leaveId, status, approvedBy, notes = null) => {
    return new Promise((resolve, reject) => {
      const approvedAt = status === 'approved' || status === 'rejected' ? new Date().toISOString() : null;
      db.run(
        'UPDATE leave_requests SET status = ?, approved_by = ?, approved_at = ?, notes = ? WHERE id = ?',
        [status, approvedBy, approvedAt, notes, leaveId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  },

  // Get approved leaves for a driver in a specific month/year
  getApprovedLeaves: (driverId, year, month) => {
    return new Promise((resolve, reject) => {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      db.all(
        `SELECT * FROM leave_requests 
         WHERE driver_id = ? 
         AND status = 'approved' 
         AND leave_date BETWEEN ? AND ?
         ORDER BY leave_date`,
        [driverId, startDate, endDate],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  // Get annual leave count for a driver in a calendar year
  getAnnualLeaveCount: (driverId, year) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as leave_count 
         FROM leave_requests 
         WHERE driver_id = ? 
         AND status = 'approved' 
         AND leave_type = 'annual'
         AND strftime('%Y', leave_date) = ?`,
        [driverId, year.toString()],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.leave_count || 0);
        }
      );
    });
  },

  // Get monthly shift data for admin editing interface
  getMonthlyShiftData: (driverId, year, month) => {
    return new Promise((resolve, reject) => {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      // Get all shifts for the month
      db.all(
        `SELECT * FROM shifts 
         WHERE driver_id = ? 
         AND date(clock_in_time) BETWEEN ? AND ?
         ORDER BY clock_in_time`,
        [driverId, startDate, endDate],
        (err, shifts) => {
          if (err) {
            reject(err);
            return;
          }

          // Create a map of date -> shift data
          const shiftsByDate = {};
          shifts.forEach(shift => {
            const shiftDate = shift.clock_in_time.split(' ')[0];
            shiftsByDate[shiftDate] = shift;
          });

          // Generate all dates in the month
          const daysInMonth = new Date(year, month, 0).getDate();
          const monthlyData = [];
          
          for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const shift = shiftsByDate[dateStr];
            
            if (shift) {
              // Extract time parts from datetime strings
              const startTimePart = shift.clock_in_time.split(' ')[1] || '';
              const endTimePart = shift.clock_out_time ? shift.clock_out_time.split(' ')[1] || '' : '';
              
              monthlyData.push({
                date: dateStr,
                shiftId: shift.id,
                startTime: startTimePart,
                endTime: endTimePart,
                startOdometer: shift.start_odometer,
                endOdometer: shift.end_odometer,
                totalDistance: shift.total_distance,
                duration: shift.shift_duration_minutes,
                status: shift.status,
                hasData: true
              });
            } else {
              monthlyData.push({
                date: dateStr,
                shiftId: null,
                startTime: '',
                endTime: '',
                startOdometer: '',
                endOdometer: '',
                totalDistance: 0,
                duration: 0,
                status: '',
                hasData: false
              });
            }
          }

          resolve(monthlyData);
        }
      );
    });
  },

  // Update existing shift entry
  updateShiftEntry: (shiftId, shiftData) => {
    return new Promise((resolve, reject) => {
      const { startTime, endTime, startOdometer, endOdometer } = shiftData;
      
      // Get the existing shift to get the date
      db.get('SELECT * FROM shifts WHERE id = ?', [shiftId], (err, shift) => {
        if (err) {
          reject(err);
          return;
        }

        if (!shift) {
          reject(new Error('Shift not found'));
          return;
        }

        const shiftDate = shift.clock_in_time.split(' ')[0];
        const clockInDateTime = `${shiftDate} ${startTime}`;
        const clockOutDateTime = endTime ? `${shiftDate} ${endTime}` : null;
        
        // Calculate duration if both times are provided
        let duration = null;
        let totalDistance = null;
        
        if (startTime && endTime && startOdometer && endOdometer) {
          const startDateTime = new Date(`${shiftDate}T${startTime}`);
          const endDateTime = new Date(`${shiftDate}T${endTime}`);
          duration = Math.round((endDateTime - startDateTime) / (1000 * 60));
          totalDistance = endOdometer - startOdometer;
        }

        db.run(
          `UPDATE shifts 
           SET clock_in_time = ?, 
               clock_out_time = ?, 
               start_odometer = ?, 
               end_odometer = ?,
               total_distance = ?,
               shift_duration_minutes = ?,
               status = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            clockInDateTime, 
            clockOutDateTime, 
            startOdometer, 
            endOdometer,
            totalDistance,
            duration,
            clockOutDateTime ? 'completed' : 'active',
            shiftId
          ],
          function(err) {
            if (err) reject(err);
            else resolve(this.changes);
          }
        );
      });
    });
  },

  // Create new shift entry
  createShiftEntry: (driverId, date, shiftData) => {
    return new Promise((resolve, reject) => {
      const { startTime, endTime, startOdometer, endOdometer } = shiftData;
      
      if (!startTime || !startOdometer) {
        reject(new Error('Start time and start odometer are required'));
        return;
      }

      const clockInDateTime = `${date} ${startTime}`;
      const clockOutDateTime = endTime ? `${date} ${endTime}` : null;
      
      // Calculate duration if both times are provided
      let duration = null;
      let totalDistance = null;
      
      if (startTime && endTime && startOdometer && endOdometer) {
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);
        duration = Math.round((endDateTime - startDateTime) / (1000 * 60));
        totalDistance = endOdometer - startOdometer;
      }

      db.run(
        `INSERT INTO shifts (driver_id, clock_in_time, clock_out_time, start_odometer, end_odometer, total_distance, shift_duration_minutes, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          driverId, 
          clockInDateTime, 
          clockOutDateTime, 
          startOdometer, 
          endOdometer,
          totalDistance,
          duration,
          clockOutDateTime ? 'completed' : 'active'
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  // Delete shift entry
  deleteShiftEntry: (shiftId) => {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM shifts WHERE id = ?',
        [shiftId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  },

  // Generate PDF for payroll data
  generatePayrollPDF: async (payrollSummaries, month, year, type) => {
    return new Promise(async (resolve, reject) => {
      try {
        const puppeteer = require('puppeteer');
        
        // Create a simple HTML content for PDF generation
        const title = type === 'ytd' ? `Year-to-Date Payroll Summary - ${year}` : 
                     `Payroll Summary - ${getMonthName(parseInt(month))} ${year}`;
        
        // Calculate totals
        const totals = payrollSummaries.reduce((acc, item) => {
          const payroll = item.payroll;
          acc.totalShifts += payroll.shifts;
          acc.totalDistance += payroll.totalDistance;
          acc.totalRegularHours += payroll.regularHours;
          acc.totalOvertimeHours += payroll.overtimeHours;
          acc.totalBaseSalary += payroll.baseSalary;
          acc.totalOvertimePay += payroll.overtimePay;
          acc.totalFuelAllowance += payroll.fuelAllowance;
          acc.totalGrossPay += payroll.grossPay;
          acc.totalDaysWorked += payroll.daysWorked;
          return acc;
        }, {
          totalShifts: 0,
          totalDistance: 0,
          totalRegularHours: 0,
          totalOvertimeHours: 0,
          totalBaseSalary: 0,
          totalOvertimePay: 0,
          totalFuelAllowance: 0,
          totalGrossPay: 0,
          totalDaysWorked: 0
        });

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
              .header { text-align: center; margin-bottom: 30px; }
              .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
              .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
              .summary-item { text-align: center; }
              .summary-item h4 { margin: 0; color: #333; font-size: 14px; }
              .summary-item .value { font-size: 16px; font-weight: bold; color: #2196f3; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
              th, td { padding: 6px; text-align: left; border: 1px solid #ddd; }
              th { background-color: #f5f5f5; font-weight: bold; }
              .totals-row { background-color: #e3f2fd; font-weight: bold; }
              .text-right { text-align: right; }
              .footer { margin-top: 30px; text-align: center; color: #666; font-size: 10px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Driver Log & Payment System</h1>
              <h2>${title}</h2>
              <p>Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</p>
            </div>

            <div class="summary">
              <h3>Summary</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <h4>Total Drivers</h4>
                  <div class="value">${payrollSummaries.length}</div>
                </div>
                <div class="summary-item">
                  <h4>Total Shifts</h4>
                  <div class="value">${totals.totalShifts}</div>
                </div>
                <div class="summary-item">
                  <h4>Total Distance</h4>
                  <div class="value">${totals.totalDistance} km</div>
                </div>
                <div class="summary-item">
                  <h4>Total Payroll</h4>
                  <div class="value">₹${totals.totalGrossPay.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Shifts</th>
                  <th>Days</th>
                  <th>Distance (km)</th>
                  <th>Regular Hours</th>
                  <th>Overtime Hours</th>
                  <th>Base Salary</th>
                  <th>Overtime Pay</th>
                  <th>Fuel Allowance</th>
                  <th>Gross Pay</th>
                </tr>
              </thead>
              <tbody>
                ${payrollSummaries.map(item => {
                  const driver = item.driver;
                  const payroll = item.payroll;
                  return `
                    <tr>
                      <td>${driver.name}<br><small>${driver.phone}</small></td>
                      <td class="text-right">${payroll.shifts}</td>
                      <td class="text-right">${payroll.daysWorked}</td>
                      <td class="text-right">${payroll.totalDistance}</td>
                      <td class="text-right">${payroll.regularHours}h</td>
                      <td class="text-right">${payroll.overtimeHours}h</td>
                      <td class="text-right">₹${payroll.baseSalary.toLocaleString()}</td>
                      <td class="text-right">₹${payroll.overtimePay.toLocaleString()}</td>
                      <td class="text-right">₹${payroll.fuelAllowance.toLocaleString()}</td>
                      <td class="text-right"><strong>₹${payroll.grossPay.toLocaleString()}</strong></td>
                    </tr>
                  `;
                }).join('')}
                <tr class="totals-row">
                  <td><strong>TOTALS</strong></td>
                  <td class="text-right"><strong>${totals.totalShifts}</strong></td>
                  <td class="text-right"><strong>${totals.totalDaysWorked}</strong></td>
                  <td class="text-right"><strong>${totals.totalDistance}</strong></td>
                  <td class="text-right"><strong>${Math.round(totals.totalRegularHours * 10) / 10}h</strong></td>
                  <td class="text-right"><strong>${Math.round(totals.totalOvertimeHours * 10) / 10}h</strong></td>
                  <td class="text-right"><strong>₹${totals.totalBaseSalary.toLocaleString()}</strong></td>
                  <td class="text-right"><strong>₹${Math.round(totals.totalOvertimePay).toLocaleString()}</strong></td>
                  <td class="text-right"><strong>₹${Math.round(totals.totalFuelAllowance).toLocaleString()}</strong></td>
                  <td class="text-right"><strong>₹${Math.round(totals.totalGrossPay).toLocaleString()}</strong></td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              <p>This is a computer-generated report from the Driver Log & Payment System.</p>
              <p>For any queries, please contact the system administrator.</p>
            </div>
          </body>
          </html>
        `;

        // Generate PDF using puppeteer
        const browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        
        const pdfBuffer = await page.pdf({
          format: 'A4',
          margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
          },
          printBackground: true
        });
        
        await browser.close();
        resolve(pdfBuffer);
        
      } catch (error) {
        console.error('PDF generation error:', error);
        reject(error);
      }
    });
  }

// Helper function for month names
function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}
};

module.exports = {
  db,
  initializeDatabase,
  dbHelpers
};