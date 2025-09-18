import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables for logging service');
}

const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY ?
    createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;

// In-memory storage for logs (fallback if Supabase is not available)
let memoryLogs: any[] = [];

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

        // Store in Supabase if available
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('model_logs')
                    .insert([enrichedLog])
                    .select('id')
                    .single();

                if (error) {
                    console.error('Supabase log storage error:', error);
                    // Fallback to memory storage
                    memoryLogs.push(enrichedLog);
                } else {
                    console.log(`✅ Log stored in Supabase: ${logData.type} (ID: ${data.id})`);
                }
            } catch (dbError) {
                console.error('Database connection error:', dbError);
                memoryLogs.push(enrichedLog);
            }
        } else {
            // Fallback to memory storage
            memoryLogs.push(enrichedLog);
            console.log(`📝 Log stored in memory: ${logData.type}`);
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

        // If Supabase is available, fetch from database
        if (supabase) {
            let query = supabase
                .from('model_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .range(Number(offset), Number(offset) + Number(limit) - 1);

            if (type) {
                query = query.eq('type', type);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching logs from Supabase:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch logs from database',
                    timestamp: new Date().toISOString()
                });
            }

            return res.json({
                success: true,
                data,
                total: data.length,
                source: 'database',
                timestamp: new Date().toISOString()
            });
        }

        // Fallback to memory logs
        let filteredLogs = memoryLogs;

        if (type) {
            filteredLogs = memoryLogs.filter(log => log.type === type);
        }

        const paginatedLogs = filteredLogs
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(Number(offset), Number(offset) + Number(limit));

        res.json({
            success: true,
            data: paginatedLogs,
            total: filteredLogs.length,
            source: 'memory',
            timestamp: new Date().toISOString()
        });

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

        if (supabase) {
            // Get stats from Supabase
            const { data, error } = await supabase
                .from('model_logs')
                .select('type, timestamp')
                .order('timestamp', { ascending: false })
                .limit(100);

            if (!error && data) {
                stats.totalLogs = data.length;
                stats.source = 'database';

                // Count by type
                data.forEach(log => {
                    stats.logsByType[log.type] = (stats.logsByType[log.type] || 0) + 1;
                });

                // Recent activity (last 10)
                stats.recentActivity = data.slice(0, 10);
            }
        } else {
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
        if (supabase) {
            const { error } = await supabase
                .from('model_logs')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

            if (error) {
                console.error('Error clearing logs from Supabase:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to clear logs from database',
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Clear memory logs
        const clearedCount = memoryLogs.length;
        memoryLogs = [];

        res.json({
            success: true,
            message: 'Logs cleared successfully',
            clearedCount,
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