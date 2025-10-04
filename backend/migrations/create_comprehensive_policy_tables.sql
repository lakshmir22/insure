-- Comprehensive Policy Tables Migration
-- This creates tables for storing detailed policy information including beneficiaries, documents, payments, and claims

-- Policy Beneficiaries Table
CREATE TABLE IF NOT EXISTS policy_beneficiaries (
    beneficiary_id SERIAL PRIMARY KEY,
    policy_id INTEGER NOT NULL REFERENCES policies(policy_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(20) NOT NULL,
    aadhar_number VARCHAR(12),
    date_of_birth DATE NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policy Documents Table
CREATE TABLE IF NOT EXISTS policy_documents (
    document_id SERIAL PRIMARY KEY,
    policy_id INTEGER NOT NULL REFERENCES policies(policy_id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(user_id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,
    verified_by INTEGER REFERENCES users(user_id)
);

-- Policy Payments Table
CREATE TABLE IF NOT EXISTS policy_payments (
    payment_id SERIAL PRIMARY KEY,
    policy_id INTEGER NOT NULL REFERENCES policies(policy_id) ON DELETE CASCADE,
    payment_type VARCHAR(50) NOT NULL, -- 'premium', 'claim', 'refund'
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50), -- 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', etc.
    payment_reference VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policy Claims Table
CREATE TABLE IF NOT EXISTS policy_claims (
    claim_id SERIAL PRIMARY KEY,
    policy_id INTEGER NOT NULL REFERENCES policies(policy_id) ON DELETE CASCADE,
    claim_number VARCHAR(100) UNIQUE NOT NULL,
    beneficiary_id INTEGER REFERENCES policy_beneficiaries(beneficiary_id),
    claim_type VARCHAR(100) NOT NULL,
    claim_amount DECIMAL(12, 2) NOT NULL,
    approved_amount DECIMAL(12, 2),
    claim_date DATE NOT NULL,
    incident_date DATE NOT NULL,
    incident_description TEXT,
    hospital_name VARCHAR(255),
    treatment_details TEXT,
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'under_review', 'approved', 'rejected', 'settled'
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(user_id),
    settlement_date TIMESTAMP,
    rejection_reason TEXT,
    blockchain_claim_id INTEGER,
    blockchain_tx_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_policy_beneficiaries_policy_id ON policy_beneficiaries(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_beneficiaries_is_primary ON policy_beneficiaries(is_primary);
CREATE INDEX IF NOT EXISTS idx_policy_documents_policy_id ON policy_documents(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_documents_type ON policy_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_policy_payments_policy_id ON policy_payments(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_payments_status ON policy_payments(status);
CREATE INDEX IF NOT EXISTS idx_policy_claims_policy_id ON policy_claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_claims_status ON policy_claims(status);
CREATE INDEX IF NOT EXISTS idx_policy_claims_claim_number ON policy_claims(claim_number);

-- Add additional columns to policies table if they don't exist
DO $$ 
BEGIN
    -- Add customer details columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'policies' AND column_name = 'customer_name') THEN
        ALTER TABLE policies ADD COLUMN customer_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'policies' AND column_name = 'customer_email') THEN
        ALTER TABLE policies ADD COLUMN customer_email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'policies' AND column_name = 'customer_phone') THEN
        ALTER TABLE policies ADD COLUMN customer_phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'policies' AND column_name = 'customer_address') THEN
        ALTER TABLE policies ADD COLUMN customer_address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'policies' AND column_name = 'plan_name') THEN
        ALTER TABLE policies ADD COLUMN plan_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'policies' AND column_name = 'members_count') THEN
        ALTER TABLE policies ADD COLUMN members_count INTEGER DEFAULT 1;
    END IF;
END $$;

-- Create triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers if they exist and recreate them
DROP TRIGGER IF EXISTS update_policy_beneficiaries_updated_at ON policy_beneficiaries;
CREATE TRIGGER update_policy_beneficiaries_updated_at
    BEFORE UPDATE ON policy_beneficiaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_policy_claims_updated_at ON policy_claims;
CREATE TRIGGER update_policy_claims_updated_at
    BEFORE UPDATE ON policy_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
