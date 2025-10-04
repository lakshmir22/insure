const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'swiftclaim-actual',
    password: 'balram16',
    port: 5432,
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('🔄 Running comprehensive policy tables migration...');
        
        const sqlPath = path.join(__dirname, 'create_comprehensive_policy_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        await client.query(sql);
        
        console.log('✅ Comprehensive policy tables migration completed successfully!');
        console.log('📋 Created tables:');
        console.log('   - policy_beneficiaries');
        console.log('   - policy_documents');
        console.log('   - policy_payments');
        console.log('   - policy_claims');
        console.log('📝 Added columns to policies table:');
        console.log('   - customer_name, customer_email, customer_phone');
        console.log('   - customer_address, plan_name, members_count');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration().catch(console.error);
