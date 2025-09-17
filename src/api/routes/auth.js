import express from 'express';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Supabase configuration
const SUPABASE_URL = "https://nyxmlsbfjmpycttacdzx.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eG1sc2Jmam1weWN0dGFjZHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNjM2NjQsImV4cCI6MjA3MjgzOTY2NH0.tV0hr8yJbTz1m5Yq1oqF6dPJyrgeg3SBz-uYq95F_a8";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'cropsense-jwt-secret-key';

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