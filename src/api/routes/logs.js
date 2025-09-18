import express from 'express';
import dotenv from 'dotenv';
import dbManager from '../utils/database.js';

// Load environment variables
dotenv.config();

const router = express.Router();

// In-memory storage for logs (fallback if database is not available)
let memoryLogs = [];

// POST /api/logs - Store model API call logs
router.post('/logs', async (req, res) => {
    try {
        const logData = req.body;

        // Validate required fields
        if (!logData.type || !logData.timestamp) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: type and timestamp',
                timestamp: new Date().toISOString()
            });
        }

        // Add server-side metadata
        const enrichedLog = {
            ...logData,
            serverTimestamp: new Date().toISOString(),
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        // Store in SQLite database
        try {
            const result = await dbManager.run(
                `INSERT INTO model_logs (type, timestamp, serverTimestamp, ipAddress, userAgent, requestId, data) 
                 VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)`,
                [
                    enrichedLog.type,
                    enrichedLog.timestamp,
                    enrichedLog.ipAddress,
                    enrichedLog.userAgent,
                    enrichedLog.requestId,
                    JSON.stringify(enrichedLog)
                ]
            );

            console.log(`✅ Log stored in SQLite: ${logData.type} (ID: ${result.lastID})`);
        } catch (dbError) {
            console.error('Database storage error:', dbError);
            // Fallback to memory storage
            memoryLogs.push(enrichedLog);
            console.log(`📝 Log stored in memory (DB failed): ${logData.type}`);
        }

        // Keep only last 1000 logs in memory to prevent memory leaks
        if (memoryLogs.length > 1000) {
            memoryLogs = memoryLogs.slice(-1000);
        }

        res.status(201).json({
            success: true,
            message: 'Log stored successfully',
            logId: enrichedLog.requestId,
            timestamp: enrichedLog.serverTimestamp
        });

    } catch (error) {
        console.error('Log storage error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to store log',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/logs - Retrieve logs (for debugging/admin purposes)
router.get('/logs', async (req, res) => {
    try {
        const { type, limit = 50, offset = 0 } = req.query;

        // Fetch from SQLite database
        try {
            let query = 'SELECT * FROM model_logs';
            let params = [];

            if (type) {
                query += ' WHERE type = ?';
                params.push(type);
            }

            query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
            params.push(Number(limit), Number(offset));

            const data = await dbManager.all(query, params);

            return res.json({
                success: true,
                data,
                total: data.length,
                source: 'database',
                timestamp: new Date().toISOString()
            });
        } catch (dbError) {
            console.error('Error fetching logs from SQLite:', dbError);
            
            // Fallback to memory logs
            let filteredLogs = memoryLogs;

            if (type) {
                filteredLogs = memoryLogs.filter(log => log.type === type);
            }

            const paginatedLogs = filteredLogs
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(Number(offset), Number(offset) + Number(limit));

            return res.json({
                success: true,
                data: paginatedLogs,
                total: filteredLogs.length,
                source: 'memory',
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch logs',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/logs/stats - Get log statistics
router.get('/logs/stats', async (req, res) => {
    try {
        const stats = {
            totalLogs: 0,
            logsByType: {},
            recentActivity: [],
            source: 'memory'
        };

        // Get stats from SQLite database
        try {
            const data = await dbManager.all(
                'SELECT type, timestamp FROM model_logs ORDER BY timestamp DESC LIMIT 100'
            );

            stats.totalLogs = data.length;
            stats.source = 'database';

            // Count by type
            data.forEach(log => {
                stats.logsByType[log.type] = (stats.logsByType[log.type] || 0) + 1;
            });

            // Recent activity (last 10)
            stats.recentActivity = data.slice(0, 10);
        } catch (dbError) {
            console.error('Database error, falling back to memory:', dbError);
            // Get stats from memory
            stats.totalLogs = memoryLogs.length;

            memoryLogs.forEach(log => {
                stats.logsByType[log.type] = (stats.logsByType[log.type] || 0) + 1;
            });

            stats.recentActivity = memoryLogs
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 10);
        }

        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching log stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch log statistics',
            timestamp: new Date().toISOString()
        });
    }
});

// DELETE /api/logs - Clear all logs (for testing/debugging)
router.delete('/logs', async (req, res) => {
    try {
        let clearedFromDB = 0;
        
        try {
            const result = await dbManager.run('DELETE FROM model_logs');
            clearedFromDB = result.changes || 0;
        } catch (dbError) {
            console.error('Error clearing logs from SQLite:', dbError);
        }

        // Clear memory logs
        const clearedFromMemory = memoryLogs.length;
        memoryLogs = [];

        res.json({
            success: true,
            message: 'Logs cleared successfully',
            clearedFromDatabase: clearedFromDB,
            clearedFromMemory: clearedFromMemory,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error clearing logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear logs',
            timestamp: new Date().toISOString()
        });
    }
});

export default router;