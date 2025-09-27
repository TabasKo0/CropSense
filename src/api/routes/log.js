import { createClient } from '@supabase/supabase-js';

// Supabase configuration using environment variables
const SUPABASE_URL =
    import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Log API - Direct Supabase calls
export const logAPI = {
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
            const { data, error } = await supabase
                .from('predictions')
                .insert([{
                    type: type.toString(),
                    log: log.toString(),
                    uuid: userId,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                console.error('Log creation error:', error);
                throw new Error(error.message);
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

            const { data, error } = await supabase
                .from('predictions')
                .select('*')
                .eq('uuid', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Logs fetch error:', error);
                throw new Error(error.message);
            }

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

            const { data, error } = await supabase
                .from('predictions')
                .select('*')
                .eq('uuid', userId)
                .eq('type', logType)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Logs fetch error:', error);
                throw new Error(error.message);
            }

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

export default logAPI;