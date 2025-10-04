const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'swiftclaim-actual',
    password: process.env.DB_PASSWORD || 'balram16',
    port: process.env.DB_PORT || 5432,
});

async function checkDatabase() {
    try {
        console.log('Checking existing database structure...');
        
        // Check existing tables
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log('Existing tables:');
        tablesResult.rows.forEach(row => {
            console.log('-', row.table_name);
        });
        
        // Check users table structure
        const usersResult = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        `);
        
        console.log('\nUsers table columns:');
        usersResult.rows.forEach(row => {
            console.log('-', row.column_name, '(', row.data_type, ')');
        });
        
    } catch (error) {
        console.error('Error checking database:', error.message);
    } finally {
        await pool.end();
    }
}

checkDatabase();
