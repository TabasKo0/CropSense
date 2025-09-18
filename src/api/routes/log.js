import express from 'express';
import { runQuery, getRow, getAllRows } from '../database.js';

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
            const result = await runQuery(
                'INSERT INTO predictions (type, log, uuid, created_at) VALUES (?, ?, ?, ?)',
                [type.toString(), log.toString(), userId, new Date().toISOString()]
            );

            // Get the created log entry
            const data = await getRow('SELECT * FROM predictions WHERE id = ?', [result.lastID]);

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

            const data = await getAllRows(
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

            const data = await getAllRows(
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

// Express routes using the logAPI
router.post('/', async (req, res) => {
    const { userId, ...logData } = req.body;
    
    if (!userId) {
        return res.status(400).json({
            success: false,
            error: 'User ID required'
        });
    }
    
    const result = await logAPI.createLog(logData, userId);
    res.json(result);
});

router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    const result = await logAPI.getUserLogs(userId);
    res.json(result);
});

router.get('/user/:userId/type/:logType', async (req, res) => {
    const { userId, logType } = req.params;
    const result = await logAPI.getLogsByType(userId, logType);
    res.json(result);
});

export default router;