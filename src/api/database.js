import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const DB_PATH = path.join(__dirname, 'cropsense.db');

// Initialize SQLite database
let db = null;

// Initialize database connection
export const initDatabase = () => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
            } else {
                console.log('✅ Connected to SQLite database');
                createTables()
                    .then(() => {
                        console.log('✅ Database tables initialized');
                        resolve(db);
                    })
                    .catch(reject);
            }
        });
    });
};

// Get database instance
export const getDatabase = () => {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
};

// Create database tables
const createTables = () => {
    return new Promise((resolve, reject) => {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                last_login TEXT
            )
        `;

        const createItemsTable = `
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id TEXT UNIQUE NOT NULL DEFAULT (hex(randomblob(16))),
                uuid INTEGER NOT NULL,
                image_link TEXT,
                image_bucket TEXT,
                title TEXT NOT NULL,
                desp TEXT NOT NULL,
                price REAL NOT NULL,
                contact TEXT NOT NULL,
                type TEXT NOT NULL,
                qty INTEGER,
                sold INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (uuid) REFERENCES users (id)
            )
        `;

        const createOrdersTable = `
            CREATE TABLE IF NOT EXISTS orders (
                order_id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id TEXT NOT NULL,
                qty INTEGER NOT NULL,
                uuid INTEGER NOT NULL,
                progress TEXT DEFAULT 'pending',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (uuid) REFERENCES users (id),
                FOREIGN KEY (item_id) REFERENCES items (item_id)
            )
        `;

        const createPredictionsTable = `
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                log TEXT NOT NULL,
                uuid INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (uuid) REFERENCES users (id)
            )
        `;

        const createAuditLogsTable = `
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT NOT NULL,
                details TEXT,
                user_id INTEGER,
                target_id TEXT,
                target_type TEXT,
                ip_address TEXT,
                user_agent TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `;

        // Execute table creation queries
        const tables = [
            createUsersTable,
            createItemsTable,
            createOrdersTable,
            createPredictionsTable,
            createAuditLogsTable
        ];

        let completed = 0;
        const total = tables.length;

        tables.forEach((sql) => {
            db.run(sql, (err) => {
                if (err) {
                    console.error('Error creating table:', err);
                    reject(err);
                } else {
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                }
            });
        });
    });
};

// Utility function to run queries with promises
export const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

// Utility function to get a single row
export const getRow = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Utility function to get all rows
export const getAllRows = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Close database connection
export const closeDatabase = () => {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('✅ Database connection closed');
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
};