import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123_abc_xyz';

// Helper to sign JWT tokens
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Simple validation
    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Please fill in all required fields (username, email, password)');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      res.status(400);
      throw new Error('Username or Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into PostgreSQL
    const result = await query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email.toLowerCase(), hashedPassword]
    );

    const newUser = result.rows[0];

    // Return user with JWT token
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: generateToken(newUser),
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter both email and password');
    }

    // Find user in PostgreSQL
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    const user = result.rows[0];

    // Check password
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        success: true,
        message: 'Login successful',
        token: generateToken(user),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = result.rows[0];

    if (!user) {
      res.status(404);
      throw new Error('User profile not found');
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
