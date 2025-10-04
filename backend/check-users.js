const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'swiftclaim-actual',
    password: process.env.DB_PASSWORD || 'balram16',
    port: process.env.DB_PORT || 5432,
});

async function checkUsers() {
    try {
        console.log('Checking users in database...');
        
        const result = await pool.query(`
            SELECT user_id, full_name, email, role, created_at 
            FROM users 
            ORDER BY created_at DESC
        `);
        
        console.log('Users found:', result.rows.length);
        result.rows.forEach((user, index) => {
            console.log(`${index + 1}. ${user.full_name} (${user.email}) - Role: ${user.role}`);
        });
        
    } catch (error) {
        console.error('Error checking users:', error.message);
    } finally {
        await pool.end();
    }
}

checkUsers();
