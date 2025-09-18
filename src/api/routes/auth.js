import express from 'express';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

// Configuration validation function
const validateEnvironmentConfig = () => {
    const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'JWT_SECRET'];
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

// Supabase configuration - Now using environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Validate required environment variables
if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL environment variable is required');
}

if (!SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_SERVICE_KEY environment variable is required');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id, username, email')
            .or(`username.eq.${username},email.eq.${email}`)
            .single();

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: existingUser.username === username ? 'Username already exists' : 'Email already exists',
                timestamp: new Date().toISOString()
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user in Supabase
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
                username,
                email,
                password_hash: hashedPassword,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select('id, username, email, created_at')
            .single();

        if (createError) {
            console.error('Supabase create error:', createError);
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

        // Find user in Supabase (allow login with username or email)
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('id, username, email, password_hash, created_at, updated_at')
            .or(`username.eq.${username},email.eq.${username}`)
            .single();

        if (findError || !user) {
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
        await supabase
            .from('users')
            .update({
                last_login: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

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

            // Get updated user data from Supabase
            const { data: user, error: findError } = await supabase
                .from('users')
                .select('id, username, email, created_at, last_login')
                .eq('id', decoded.id)
                .single();

            if (findError || !user) {
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