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
        console.log('🔄 Fixing notifications type constraint...');
        
        const sqlPath = path.join(__dirname, 'fix_notifications_type.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        await client.query(sql);
        
        console.log('✅ Notifications type constraint fixed successfully!');
        console.log('📝 Allowed notification types:');
        console.log('   - policy_purchased, policy_sold, policy_renewed, policy_expired, policy_cancelled');
        console.log('   - new_claim, claim_submitted, claim_approved, claim_rejected, claim_settled, claim_updated');
        console.log('   - payment_received, payment_pending, payment_failed, payment_refunded');
        console.log('   - document_uploaded, document_verified, document_rejected');
        console.log('   - ai_analysis_complete, provider_review_required');
        console.log('   - system_alert, reminder, general');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration().catch(console.error);
