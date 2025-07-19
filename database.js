
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
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
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
            const testUser = await dbHelpers.getDriverByEmail('test@driver.com');
            if (!testUser) {
              const bcrypt = require('bcryptjs');
              const testPassword = await bcrypt.hash('password123', 10);
              await dbHelpers.createDriver({
                name: 'Test Driver',
                email: 'test@driver.com',
                password_hash: testPassword,
                phone: '+1234567890'
              });
              console.log('🧪 Test driver account created: test@driver.com / password123');
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

  // Create new driver
  createDriver: (driverData) => {
    return new Promise((resolve, reject) => {
      const { name, email, password_hash, phone } = driverData;
      db.run(
        'INSERT INTO drivers (name, email, password_hash, phone) VALUES (?, ?, ?, ?)',
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
      db.run(
        'INSERT INTO shifts (driver_id, clock_in_time, start_odometer) VALUES (?, CURRENT_TIMESTAMP, ?)',
        [driverId, startOdometer],
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
      db.run(
        `UPDATE shifts 
         SET clock_out_time = CURRENT_TIMESTAMP, 
             end_odometer = ?,
             total_distance = ? - start_odometer,
             shift_duration_minutes = (strftime('%s', CURRENT_TIMESTAMP) - strftime('%s', clock_in_time)) / 60,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [endOdometer, endOdometer, shiftId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
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
  }
};

module.exports = {
  db,
  initializeDatabase,
  dbHelpers
};
