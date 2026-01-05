const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Oracle DB Configuration
const dbConfig = {
    user: 'BookingManager',
    password: process.env.DB_PASSWORD || 'your_password_here',
    connectString: process.env.DB_CONNECTION || 'localhost:1521/XE'
};

// Database connection pool
let pool;

async function initializeDB() {
    try {
        pool = await oracledb.createPool({
            ...dbConfig,
            poolMin: 2,
            poolMax: 10,
            poolIncrement: 1
        });
        console.log('Oracle DB pool created successfully');
    } catch (err) {
        console.error('Error creating Oracle DB pool:', err);
    }
}

// API Routes

// Get top-rated drivers
app.get('/api/top-drivers', async (req, res) => {
    let connection;
    
    try {
        connection = await pool.getConnection();
        
        const query = `
            SELECT 
                d.name,
                COUNT(r.ride_id) as total_rides,
                ROUND(AVG(r.rating), 2) as avg_rating
            FROM drivers d
            JOIN rides r ON d.driver_id = r.driver_id
            WHERE r.ride_date >= TRUNC(SYSDATE, 'MM')
                AND r.status = 'COMPLETED'
            GROUP BY d.driver_id, d.name
            HAVING COUNT(r.ride_id) > 10
                AND AVG(r.rating) >= 4.5
            ORDER BY avg_rating DESC, total_rides DESC
        `;
        
        const result = await connection.execute(query);
        
        const drivers = result.rows.map(row => ({
            name: row[0],
            total_rides: row[1],
            avg_rating: row[2]
        }));
        
        res.json(drivers);
        
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ 
            error: 'Database connection failed',
            details: err.message 
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

// Get all accessible tables
app.get('/api/tables', async (req, res) => {
    let connection;
    
    try {
        connection = await pool.getConnection();
        
        const query = `
            SELECT table_name as name
            FROM user_tables
            ORDER BY table_name
        `;
        
        const result = await connection.execute(query);
        
        const tables = result.rows.map(row => ({
            name: row[0]
        }));
        
        res.json(tables);
        
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ 
            error: 'Failed to fetch tables',
            details: err.message 
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

// Get table data
app.get('/api/table/:tableName', async (req, res) => {
    let connection;
    const { tableName } = req.params;
    
    // Basic SQL injection protection
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(tableName)) {
        return res.status(400).json({ error: 'Invalid table name' });
    }
    
    try {
        connection = await pool.getConnection();
        
        const query = `SELECT * FROM ${tableName} WHERE ROWNUM <= 100`;
        const result = await connection.execute(query);
        
        // Convert result to JSON format
        const columns = result.metaData.map(col => col.name);
        const data = result.rows.map(row => {
            const obj = {};
            columns.forEach((col, index) => {
                obj[col] = row[index];
            });
            return obj;
        });
        
        res.json(data);
        
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ 
            error: 'Failed to fetch table data',
            details: err.message 
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.execute('SELECT 1 FROM DUAL');
        await connection.close();
        res.json({ status: 'healthy', database: 'connected' });
    } catch (err) {
        res.status(500).json({ 
            status: 'unhealthy', 
            database: 'disconnected',
            error: err.message 
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    if (pool) {
        try {
            await pool.close();
            console.log('Database pool closed');
        } catch (err) {
            console.error('Error closing pool:', err);
        }
    }
    process.exit(0);
});

// Start server
async function startServer() {
    await initializeDB();
    
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('Oracle Interface ready for BookingManager');
    });
}

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});