
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

// Login function - supports both email and phone
async function loginDriver(identifier, password) {
  try {
    let driver;
    
    // Check if identifier is email or phone
    if (identifier.includes('@')) {
      driver = await dbHelpers.getDriverByEmail(identifier);
    } else {
      driver = await dbHelpers.getDriverByPhone(identifier);
    }
    
    if (!driver) {
      throw new Error('Driver not found');
    }

    if (!driver.is_phone_verified) {
      throw new Error('Phone number not verified. Please verify your phone first.');
    }

    const isValidPassword = await verifyPassword(password, driver.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid password');
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

// Send SMS verification code (mock function - replace with real SMS service)
async function sendSMSVerification(phone) {
  try {
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update database with verification code
    await dbHelpers.updateVerificationCode(phone, verificationCode);
    
    // Mock SMS sending - replace with actual SMS service like Twilio
    console.log(`📱 SMS Verification Code for ${phone}: ${verificationCode}`);
    
    // In production, replace this with actual SMS service:
    // await twilioClient.messages.create({
    //   body: `Your verification code is: ${verificationCode}`,
    //   from: '+1234567890', // Your Twilio number
    //   to: phone
    // });
    
    return {
      success: true,
      message: 'Verification code sent successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to send verification code'
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

// Register function - phone-based registration
async function registerDriver(name, phone, email, password) {
  try {
    // Check if phone already exists
    const existingDriverByPhone = await dbHelpers.getDriverByPhone(phone);
    if (existingDriverByPhone) {
      throw new Error('Phone number already registered');
    }

    // Check email if provided
    if (email) {
      const existingDriverByEmail = await dbHelpers.getDriverByEmail(email);
      if (existingDriverByEmail) {
        throw new Error('Email already registered');
      }
    }

    const password_hash = password ? await hashPassword(password) : null;
    const driverId = await dbHelpers.createDriver({
      name,
      email: email || null,
      password_hash,
      phone
    });

    // Send SMS verification
    const smsResult = await sendSMSVerification(phone);
    if (!smsResult.success) {
      throw new Error('Failed to send verification SMS');
    }

    return {
      success: true,
      message: 'Registration successful. Please verify your phone number.',
      driverId,
      requiresVerification: true
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
