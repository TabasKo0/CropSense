import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'data', 'cropsense.db');

// Ensure the data directory exists
const dataDir = dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Enable verbose mode for debugging
sqlite3.verbose();

class DatabaseManager {
    constructor() {
        this.db = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                } else {
                    console.log('✅ Connected to SQLite database');
                    // Enable foreign keys
                    this.db.run('PRAGMA foreign_keys = ON');
                    resolve();
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async initializeSchema() {
        try {
            // Users table
            await this.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME,
                    is_active BOOLEAN DEFAULT 1,
                    email_verified BOOLEAN DEFAULT 0
                )
            `);

            // Items table
            await this.run(`
                CREATE TABLE IF NOT EXISTS items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    item_id TEXT UNIQUE DEFAULT (hex(randomblob(16))),
                    uuid TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    price REAL,
                    contact TEXT,
                    type TEXT,
                    qty INTEGER,
                    image_link TEXT,
                    image_bucket TEXT,
                    sold BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (uuid) REFERENCES users(id)
                )
            `);

            // Orders table
            await this.run(`
                CREATE TABLE IF NOT EXISTS orders (
                    order_id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                    uuid TEXT NOT NULL,
                    item_id TEXT NOT NULL,
                    qty INTEGER NOT NULL,
                    progress TEXT DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (uuid) REFERENCES users(id),
                    FOREIGN KEY (item_id) REFERENCES items(item_id)
                )
            `);

            // Predictions table (for logs)
            await this.run(`
                CREATE TABLE IF NOT EXISTS predictions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    uuid TEXT NOT NULL,
                    type TEXT NOT NULL,
                    log TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (uuid) REFERENCES users(id)
                )
            `);

            // Model logs table
            await this.run(`
                CREATE TABLE IF NOT EXISTS model_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    serverTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    ipAddress TEXT,
                    userAgent TEXT,
                    requestId TEXT,
                    data TEXT -- JSON string for additional data
                )
            `);

            // Create indexes
            await this.run('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
            await this.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
            await this.run('CREATE INDEX IF NOT EXISTS idx_items_uuid ON items(uuid)');
            await this.run('CREATE INDEX IF NOT EXISTS idx_items_item_id ON items(item_id)');
            await this.run('CREATE INDEX IF NOT EXISTS idx_orders_uuid ON orders(uuid)');
            await this.run('CREATE INDEX IF NOT EXISTS idx_orders_item_id ON orders(item_id)');
            await this.run('CREATE INDEX IF NOT EXISTS idx_predictions_uuid ON predictions(uuid)');
            await this.run('CREATE INDEX IF NOT EXISTS idx_model_logs_type ON model_logs(type)');

            console.log('✅ Database schema initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing database schema:', error);
            throw error;
        }
    }
}

// Create a singleton instance
const dbManager = new DatabaseManager();

export default dbManager;