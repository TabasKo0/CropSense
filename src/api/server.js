import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import dbManager from './utils/database.js';

// Import routes
import cropAnalysisRoutes from './routes/cropAnalysis.js';
import weatherRoutes from './routes/weather.js';
import marketplaceRoutes from './routes/marketplace.js';
import authRoutes from './routes/auth.js';
import itemsRoutes from './routes/items.js';
import ordersRoutes from './routes/orders.js';
import logRoutes from './routes/log.js';
import logsRoutes from './routes/logs.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
async function initializeDatabase() {
    try {
        await dbManager.connect();
        await dbManager.initializeSchema();
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        process.exit(1);
    }
}

// Get allowed origins from environment variables or use defaults
const allowedOrigins = process.env.CORS_ORIGINS ?
    process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000'];

// Middleware
app.use(helmet());
app.use(cors({
    origin: allowedOrigins, // Use environment variable or defaults
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/crop-analysis', cropAnalysisRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/log', logRoutes);
app.use('/api', logsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'CropSense API',
        version: '1.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to CropSense API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            cropAnalysis: '/api/crop-analysis',
            weather: '/api/weather',
            marketplace: '/api/marketplace'
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(error.status || 500).json({
        error: error.message || 'Internal Server Error',
        timestamp: new Date().toISOString()
    });
});

// Start server
async function startServer() {
    await initializeDatabase();
    
    app.listen(PORT, () => {
        console.log(`🌱 CropSense API server running on port ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`🚀 API documentation: http://localhost:${PORT}/`);
    });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n📤 Gracefully shutting down...');
    await dbManager.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n📤 Gracefully shutting down...');
    await dbManager.close();
    process.exit(0);
});

startServer().catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});

export default app;