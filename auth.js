
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

// Login function - simplified for single driver use
async function loginDriver(identifier, password) {
  try {
    // For single driver app, use any alphanumeric string as user ID
    if (!identifier || !password) {
      throw new Error('User ID and password required');
    }

    // Get or create driver with this identifier
    let driver = await dbHelpers.getDriverByIdentifier(identifier);
    
    if (!driver) {
      // Auto-create driver for new identifiers
      const hashedPassword = await hashPassword(password);
      const driverId = await dbHelpers.createDriver({
        name: identifier,
        email: null,
        password_hash: hashedPassword,
        phone: identifier
      });
      
      driver = {
        id: driverId,
        name: identifier,
        phone: identifier,
        email: null,
        password_hash: hashedPassword,
        is_phone_verified: 1
      };
    } else {
      // Verify password for existing driver
      const isValidPassword = await verifyPassword(password, driver.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }
    }

    const token = generateToken(driver.id, driver.phone);
    return {
      success: true,
      token,
      driver: {
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
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

// Send SMS verification code using seven.io
async function sendSMSVerification(phone) {
  try {
    const axios = require('axios');
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update database with verification code
    await dbHelpers.updateVerificationCode(phone, verificationCode);
    
    // seven.io API configuration
    const SEVEN_IO_API_KEY = process.env.SEVEN_IO_API_KEY;
    
    if (!SEVEN_IO_API_KEY) {
      // Fallback to console logging for development
      console.log(`📱 SMS Verification Code for ${phone}: ${verificationCode}`);
      console.log('⚠️  SEVEN_IO_API_KEY not found in environment variables');
      return {
        success: true,
        message: 'Verification code generated (check console in development)'
      };
    }
    
    // Format phone number for international format
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    
    // Send SMS via seven.io
    const smsResponse = await axios.post('https://gateway.seven.io/api/sms', null, {
      params: {
        apikey: SEVEN_IO_API_KEY,
        to: formattedPhone,
        text: `Your Driver Log verification code is: ${verificationCode}`,
        from: 'DriverLog' // Optional sender ID
      }
    });
    
    // Check if SMS was sent successfully
    if (smsResponse.data && smsResponse.data !== '101') {
      console.log(`✅ SMS sent successfully to ${phone}`);
      return {
        success: true,
        message: 'Verification code sent successfully'
      };
    } else {
      throw new Error('seven.io API error: ' + smsResponse.data);
    }
    
  } catch (error) {
    console.error('SMS sending error:', error.message);
    
    // Fallback to console logging if SMS service fails
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    await dbHelpers.updateVerificationCode(phone, verificationCode);
    console.log(`📱 SMS Verification Code for ${phone}: ${verificationCode}`);
    
    return {
      success: true,
      message: 'Verification code generated (SMS service unavailable)'
    };
  }
}

// Verify SMS code
async function verifySMSCode(phone, code) {
  try {
    const driver = await dbHelpers.verifyPhoneNumber(phone, code);
    if (!driver) {
      throw new Error('Invalid or expired verification code');
    }

    return {
      success: true,
      message: 'Phone number verified successfully',
      driver: {
        id: driver.id,
        name: driver.name,
        phone: driver.phone
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Register function - simplified without SMS verification
async function registerDriver(name, phone, email, password) {
  try {
    // Check if identifier already exists
    const existingDriver = await dbHelpers.getDriverByIdentifier(phone);
    if (existingDriver) {
      throw new Error('User ID already registered');
    }

    const password_hash = password ? await hashPassword(password) : null;
    const driverId = await dbHelpers.createDriver({
      name,
      email: email || null,
      password_hash,
      phone
    });

    return {
      success: true,
      message: 'Registration successful. You can now login.',
      driverId,
      requiresVerification: false
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
  registerDriver,
  sendSMSVerification,
  verifySMSCode
};
