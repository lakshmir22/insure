const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'swiftclaim-actual',
    password: process.env.DB_PASSWORD || 'balram16',
    port: process.env.DB_PORT || 5432,
});

async function updatePolicySchema() {
    try {
        console.log('Updating policy schema for comprehensive insurance details...');
        
        // Add comprehensive fields to policies table
        await pool.query(`
            ALTER TABLE policies 
            ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
            ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
            ADD COLUMN IF NOT EXISTS customer_address TEXT,
            ADD COLUMN IF NOT EXISTS plan_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS members_count INTEGER DEFAULT 1,
            ADD COLUMN IF NOT EXISTS claims_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS last_claim_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS policy_documents JSONB DEFAULT '[]'::jsonb
        `);
        console.log('✅ Added comprehensive fields to policies table');

        // Create policy_documents table for file storage
        await pool.query(`
            CREATE TABLE IF NOT EXISTS policy_documents (
                document_id SERIAL PRIMARY KEY,
                policy_id INTEGER REFERENCES policies(policy_id) ON DELETE CASCADE,
                document_type VARCHAR(100) NOT NULL,
                document_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_size BIGINT,
                mime_type VARCHAR(100),
                uploaded_by INTEGER REFERENCES users(user_id),
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_verified BOOLEAN DEFAULT FALSE,
                verification_notes TEXT
            )
        `);
        console.log('✅ Created policy_documents table');

        // Create policy_beneficiaries table for family members
        await pool.query(`
            CREATE TABLE IF NOT EXISTS policy_beneficiaries (
                beneficiary_id SERIAL PRIMARY KEY,
                policy_id INTEGER REFERENCES policies(policy_id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                relationship VARCHAR(50) NOT NULL,
                age INTEGER,
                gender VARCHAR(10),
                aadhar_number VARCHAR(12),
                date_of_birth DATE,
                is_primary BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created policy_beneficiaries table');

        // Create policy_claims table for claim history
        await pool.query(`
            CREATE TABLE IF NOT EXISTS policy_claims (
                claim_id SERIAL PRIMARY KEY,
                policy_id INTEGER REFERENCES policies(policy_id) ON DELETE CASCADE,
                claim_number VARCHAR(50) UNIQUE NOT NULL,
                claim_type VARCHAR(50) NOT NULL,
                claim_amount DECIMAL(15,2) NOT NULL,
                incident_date DATE NOT NULL,
                claim_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) DEFAULT 'pending',
                description TEXT,
                settlement_amount DECIMAL(15,2),
                settlement_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created policy_claims table');

        // Create policy_payments table for payment history
        await pool.query(`
            CREATE TABLE IF NOT EXISTS policy_payments (
                payment_id SERIAL PRIMARY KEY,
                policy_id INTEGER REFERENCES policies(policy_id) ON DELETE CASCADE,
                payment_type VARCHAR(50) NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                payment_method VARCHAR(50),
                payment_reference VARCHAR(100),
                payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) DEFAULT 'completed',
                transaction_id VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created policy_payments table');

        // Create indexes for performance
        await pool.query('CREATE INDEX IF NOT EXISTS idx_policy_documents_policy ON policy_documents(policy_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_policy_beneficiaries_policy ON policy_beneficiaries(policy_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_policy_claims_policy ON policy_claims(policy_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_policy_payments_policy ON policy_payments(policy_id)');
        console.log('✅ Created indexes');

        console.log('\n🎉 Policy schema updated successfully!');
        
    } catch (error) {
        console.error('❌ Error updating schema:', error.message);
        console.error('Full error:', error);
    } finally {
        await pool.end();
    }
}

updatePolicySchema();
