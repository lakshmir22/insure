-- Claims Table for AI-powered claim processing
CREATE TABLE IF NOT EXISTS claims (
    claim_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    policy_id INTEGER NOT NULL REFERENCES policies(policy_id) ON DELETE CASCADE,
    policy_number VARCHAR(100) NOT NULL,
    incident_description TEXT NOT NULL,
    claim_amount DECIMAL(12, 2) NOT NULL,
    filing_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    claim_status VARCHAR(50) DEFAULT 'pending_ai_analysis',
    claim_type VARCHAR(50) DEFAULT 'health',
    aabha_id VARCHAR(50),
    hospital_name VARCHAR(255),
    treatment_details TEXT,
    abdm_data JSONB,
    bank_account VARCHAR(50),
    ifsc_code VARCHAR(20),
    beneficiary_name VARCHAR(255),
    ai_analysis JSONB,
    ai_recommendation VARCHAR(50),
    ai_confidence_score DECIMAL(5, 2),
    approved_amount DECIMAL(12, 2),
    rejection_reason TEXT,
    reviewed_by INTEGER REFERENCES users(user_id),
    reviewed_at TIMESTAMP,
    payout_status VARCHAR(50) DEFAULT 'pending',
    payout_reference VARCHAR(255),
    payout_amount DECIMAL(12, 2),
    payout_date TIMESTAMP,
    blockchain_claim_id INTEGER,
    blockchain_tx_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Claim Documents Table
CREATE TABLE IF NOT EXISTS claim_documents (
    document_id SERIAL PRIMARY KEY,
    claim_id INTEGER NOT NULL REFERENCES claims(claim_id) ON DELETE CASCADE,
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

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_policy_id ON claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(claim_status);
CREATE INDEX IF NOT EXISTS idx_claims_filing_date ON claims(filing_date DESC);
CREATE INDEX IF NOT EXISTS idx_claim_documents_claim_id ON claim_documents(claim_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_claims_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_claims_updated_at ON claims;
CREATE TRIGGER update_claims_updated_at
    BEFORE UPDATE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION update_claims_updated_at_column();

COMMIT;
