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
        console.log('🔄 Running claims table migration...');
        
        const sqlPath = path.join(__dirname, 'create_claims_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        await client.query(sql);
        
        console.log('✅ Claims table migration completed successfully!');
        console.log('📋 Created tables:');
        console.log('   - claims (for AI-powered claim processing)');
        console.log('   - claim_documents (for claim supporting documents)');
        console.log('📝 Features:');
        console.log('   - ABDM/AABHA integration support');
        console.log('   - AI analysis storage (recommendation, confidence score)');
        console.log('   - Bank account details for payouts');
        console.log('   - Blockchain integration fields');
        console.log('   - Document verification tracking');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration().catch(console.error);
