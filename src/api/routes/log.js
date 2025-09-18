import express from 'express';
import dbManager from '../utils/database.js';

const router = express.Router();

// Log API - Direct SQLite calls
const logAPI = {
    // POST - Create a new log entry
    async createLog(logData, userId) {
        try {
            const { type, log } = logData;

            // Validation
            if (!type || !log) {
                return {
                    success: false,
                    error: 'Type and log are required'
                };
            }

            if (!userId) {
                return {
                    success: false,
                    error: 'User authentication required'
                };
            }

            // Insert log entry into predictions table
            const result = await dbManager.run(
                `INSERT INTO predictions (type, log, uuid, created_at) 
                 VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                [type.toString(), log.toString(), userId]
            );

            // Get the created log entry
            const data = await dbManager.get(
                'SELECT * FROM predictions WHERE rowid = ?',
                [result.lastID]
            );

            if (!data) {
                throw new Error('Failed to retrieve created log entry');
            }

            return {
                success: true,
                message: 'Log entry created successfully',
                data: data
            };

        } catch (error) {
            console.error('Log creation error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create log entry'
            };
        }
    },

    // GET - Fetch user logs
    async getUserLogs(userId) {
        try {
            if (!userId) {
                return {
                    success: false,
                    error: 'User authentication required'
                };
            }

            const data = await dbManager.all(
                'SELECT * FROM predictions WHERE uuid = ? ORDER BY created_at DESC',
                [userId]
            );

            return {
                success: true,
                logs: data || [],
                count: data ? data.length : 0
            };

        } catch (error) {
            console.error('Logs retrieval error:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch logs',
                logs: [],
                count: 0
            };
        }
    },

    // GET - Fetch logs by type
    async getLogsByType(userId, logType) {
        try {
            if (!userId) {
                return {
                    success: false,
                    error: 'User authentication required'
                };
            }

            if (!logType) {
                return {
                    success: false,
                    error: 'Log type is required'
                };
            }

            const data = await dbManager.all(
                'SELECT * FROM predictions WHERE uuid = ? AND type = ? ORDER BY created_at DESC',
                [userId, logType]
            );

            return {
                success: true,
                logs: data || [],
                count: data ? data.length : 0
            };

        } catch (error) {
            console.error('Logs retrieval error:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch logs',
                logs: [],
                count: 0
            };
        }
    }
};

// Express routes that use the logAPI
// POST /api/log - Create a new log entry
router.post('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // Simple auth for now
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const result = await logAPI.createLog(req.body, userId);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/log - Fetch user logs
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // Simple auth for now
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const result = await logAPI.getUserLogs(userId);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/log/:type - Fetch logs by type
router.get('/:type', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // Simple auth for now
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { type } = req.params;
        const result = await logAPI.getLogsByType(userId, type);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

export default router;