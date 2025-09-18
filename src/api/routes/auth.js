import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { runQuery, getRow, getAllRows } from '../database.js';

// Load environment variables
dotenv.config();

const router = express.Router();

// Configuration validation function
const validateEnvironmentConfig = () => {
    const requiredVars = ['JWT_SECRET'];
    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (process.env.JWT_SECRET.length < 32) {
        console.warn('⚠️  Warning: JWT_SECRET should be at least 32 characters long for security');
    }

    console.log('✅ Environment configuration validated successfully');
};

// Validate configuration on module load
validateEnvironmentConfig();

// JWT secret - Now using environment variable with validation
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}

if (JWT_SECRET.length < 32) {
    console.warn('Warning: JWT_SECRET should be at least 32 characters long for security');
}

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign({
            id: user.id,
            username: user.username,
            email: user.email
        },
        JWT_SECRET, { expiresIn: '7d' }
    );
};

// Helper function to hash password
const hashPassword = async(password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// Helper function to compare password
const comparePassword = async(password, hash) => {
    return await bcrypt.compare(password, hash);
};

// POST /api/auth/signup - User registration
router.post('/signup', async(req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username, email, and password are required',
                timestamp: new Date().toISOString()
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format',
                timestamp: new Date().toISOString()
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long',
                timestamp: new Date().toISOString()
            });
        }

        // Check if user already exists
        const existingUser = await getRow(
            'SELECT id, username, email FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: existingUser.username === username ? 'Username already exists' : 'Email already exists',
                timestamp: new Date().toISOString()
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user in SQLite
        const result = await runQuery(
            'INSERT INTO users (username, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, new Date().toISOString(), new Date().toISOString()]
        );

        // Get the created user
        const newUser = await getRow(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            [result.lastID]
        );

        if (!newUser) {
            return res.status(500).json({
                success: false,
                error: 'Failed to create user account',
                timestamp: new Date().toISOString()
            });
        }

        // Generate JWT token
        const token = generateToken(newUser);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    createdAt: newUser.created_at
                },
                token
            },
            message: 'User account created successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during signup',
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/auth/signin - User login
router.post('/signin', async(req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required',
                timestamp: new Date().toISOString()
            });
        }

        // Find user in SQLite (allow login with username or email)
        const user = await getRow(
            'SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid username or password',
                timestamp: new Date().toISOString()
            });
        }

        // Compare password
        const isValidPassword = await comparePassword(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid username or password',
                timestamp: new Date().toISOString()
            });
        }

        // Update last login time
        await runQuery(
            'UPDATE users SET last_login = ?, updated_at = ? WHERE id = ?',
            [new Date().toISOString(), new Date().toISOString(), user.id]
        );

        // Generate JWT token
        const token = generateToken(user);

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    createdAt: user.created_at
                },
                token
            },
            message: 'Login successful',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during signin',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/auth/profile - Get user profile (protected route)
router.get('/profile', async(req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authorization token required',
                timestamp: new Date().toISOString()
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            // Get updated user data from SQLite
            const user = await getRow(
                'SELECT id, username, email, created_at, last_login FROM users WHERE id = ?',
                [decoded.id]
            );

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found',
                    timestamp: new Date().toISOString()
                });
            }

            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        createdAt: user.created_at,
                        lastLogin: user.last_login
                    }
                },
                timestamp: new Date().toISOString()
            });

        } catch (jwtError) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/auth/logout - User logout
router.post('/logout', (req, res) => {
    // Since we're using JWT, logout is handled client-side by removing the token
    res.json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date().toISOString()
    });
});

export default router;