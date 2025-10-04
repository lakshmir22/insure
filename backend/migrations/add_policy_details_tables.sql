-- Add additional columns to policies table for complete details
ALTER TABLE policies ADD COLUMN IF NOT EXISTS plan_name VARCHAR(100);
ALTER TABLE policies ADD COLUMN IF NOT EXISTS sum_insured DECIMAL(15,2);
ALTER TABLE policies ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
ALTER TABLE policies ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100);
ALTER TABLE policies ADD COLUMN IF NOT EXISTS last_claim_date DATE;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS claims_count INTEGER DEFAULT 0;

-- Create policy_members table (for family floater policies)
CREATE TABLE IF NOT EXISTS policy_members (
    member_id SERIAL PRIMARY KEY,
    policy_id INTEGER REFERENCES policies(policy_id) ON DELETE CASCADE,
    member_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL CHECK (relationship IN ('self', 'spouse', 'child', 'parent', 'sibling', 'other')),
    date_of_birth DATE NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    occupation VARCHAR(100),
    pre_existing_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create policy_documents table
CREATE TABLE IF NOT EXISTS policy_documents (
    document_id SERIAL PRIMARY KEY,
    policy_id INTEGER REFERENCES policies(policy_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('kyc', 'medical_report', 'age_proof', 'address_proof', 'income_proof', 'identity_proof', 'other')),
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,
    verified_by INTEGER REFERENCES users(user_id)
);

-- Create policy_nominees table
CREATE TABLE IF NOT EXISTS policy_nominees (
    nominee_id SERIAL PRIMARY KEY,
    policy_id INTEGER REFERENCES policies(policy_id) ON DELETE CASCADE,
    nominee_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    percentage_share INTEGER DEFAULT 100 CHECK (percentage_share > 0 AND percentage_share <= 100),
    contact_number VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create policy_riders table (additional coverage)
CREATE TABLE IF NOT EXISTS policy_riders (
    rider_id SERIAL PRIMARY KEY,
    policy_id INTEGER REFERENCES policies(policy_id) ON DELETE CASCADE,
    rider_name VARCHAR(100) NOT NULL,
    rider_description TEXT,
    coverage_amount DECIMAL(15,2) NOT NULL,
    premium_amount DECIMAL(15,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create medical_history table
CREATE TABLE IF NOT EXISTS medical_history (
    history_id SERIAL PRIMARY KEY,
    policy_id INTEGER REFERENCES policies(policy_id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES policy_members(member_id) ON DELETE CASCADE,
    condition_name VARCHAR(200) NOT NULL,
    diagnosis_date DATE,
    treatment_details TEXT,
    current_status VARCHAR(50) CHECK (current_status IN ('ongoing', 'recovered', 'chronic', 'under_observation')),
    doctor_name VARCHAR(100),
    hospital_name VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_policy_members_policy ON policy_members(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_documents_policy ON policy_documents(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_documents_user ON policy_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_documents_type ON policy_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_policy_nominees_policy ON policy_nominees(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_riders_policy ON policy_riders(policy_id);
CREATE INDEX IF NOT EXISTS idx_medical_history_policy ON medical_history(policy_id);
CREATE INDEX IF NOT EXISTS idx_medical_history_member ON medical_history(member_id);

-- Add comment for documentation
COMMENT ON TABLE policy_members IS 'Stores information about all members covered under a policy (for family floater plans)';
COMMENT ON TABLE policy_documents IS 'Stores all documents uploaded for policy verification';
COMMENT ON TABLE policy_nominees IS 'Stores nominee information for each policy';
COMMENT ON TABLE policy_riders IS 'Stores additional riders/coverage added to policies';
COMMENT ON TABLE medical_history IS 'Stores medical history of policy members for risk assessment';
