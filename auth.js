
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbHelpers } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Hash password
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password
async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
function generateToken(driverId, email) {
  return jwt.sign(
    { driverId, email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware to authenticate requests
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

// Login function
async function loginDriver(email, password) {
  try {
    const driver = await dbHelpers.getDriverByEmail(email);
    if (!driver) {
      throw new Error('Driver not found');
    }

    const isValidPassword = await verifyPassword(password, driver.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    const token = generateToken(driver.id, driver.email);
    return {
      success: true,
      token,
      driver: {
        id: driver.id,
        name: driver.name,
        email: driver.email
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Register function
async function registerDriver(name, email, password, phone) {
  try {
    const existingDriver = await dbHelpers.getDriverByEmail(email);
    if (existingDriver) {
      throw new Error('Email already registered');
    }

    const password_hash = await hashPassword(password);
    const driverId = await dbHelpers.createDriver({
      name,
      email,
      password_hash,
      phone
    });

    const token = generateToken(driverId, email);
    return {
      success: true,
      token,
      driver: {
        id: driverId,
        name,
        email
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  authenticateToken,
  loginDriver,
  registerDriver
};
