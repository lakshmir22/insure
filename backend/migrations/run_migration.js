require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'swiftclaim-actual',
    password: process.env.DB_PASSWORD || 'balram16',
    port: process.env.DB_PORT || 5432,
});

async function runMigration() {
    const client = await pool.connect();
    
    try {
        console.log('Starting migration...');
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'create_policy_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Execute the SQL
        await client.query(sql);
        
        console.log('✅ Migration completed successfully!');
        console.log('Tables created:');
        console.log('  - policy_templates');
        console.log('  - policies');
        console.log('  - payments');
        console.log('  - notifications');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Details:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
