-- Comprehensive Insurance Database Schema
-- This schema supports the full end-to-end insurance flow

-- Users table (existing)
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'admin', 'insurer', 'agent')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policy Templates table (for providers to create policy offerings)
CREATE TABLE IF NOT EXISTS policy_templates (
    template_id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    policy_type VARCHAR(50) NOT NULL CHECK (policy_type IN ('Health', 'Vehicle', 'Life', 'Travel', 'Property')),
    coverage_amount DECIMAL(15,2) NOT NULL,
    premium DECIMAL(15,2) NOT NULL,
    insurance_exp_date TIMESTAMP NOT NULL,
    max_claims_per_year INTEGER NOT NULL,
    description TEXT NOT NULL,
    terms_and_conditions TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    blockchain_template_id INTEGER, -- Maps to smart contract template ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policies table (actual purchased policies)
CREATE TABLE IF NOT EXISTS policies (
    policy_id SERIAL PRIMARY KEY,
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    template_id INTEGER REFERENCES policy_templates(template_id) ON DELETE CASCADE,
    holder_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    policy_type VARCHAR(50) NOT NULL,
    coverage_amount DECIMAL(15,2) NOT NULL,
    premium DECIMAL(15,2) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
    blockchain_policy_id INTEGER, -- Maps to smart contract policy ID
    blockchain_tx_hash VARCHAR(66), -- Transaction hash for policy creation
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Claims table (existing, enhanced)
CREATE TABLE IF NOT EXISTS claims (
    claim_id SERIAL PRIMARY KEY,
    policy_id INTEGER REFERENCES policies(policy_id) ON DELETE CASCADE,
    holder_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    claim_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    incident_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'approved', 'rejected', 'paid')),
    cashfree_txn_id VARCHAR(100), -- For payment processing
    blockchain_claim_id INTEGER, -- Maps to smart contract claim ID
    blockchain_tx_hash VARCHAR(66), -- Transaction hash for claim submission
    verification_notes TEXT,
    processed_by INTEGER REFERENCES users(user_id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Claim-specific data (health, travel, etc.)
CREATE TABLE IF NOT EXISTS claim_details (
    claim_detail_id SERIAL PRIMARY KEY,
    claim_id INTEGER REFERENCES claims(claim_id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL, -- e.g., 'aabha_id', 'flight_id', 'vehicle_number'
    field_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table (for tracking all payments)
CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    policy_id INTEGER REFERENCES policies(policy_id) ON DELETE CASCADE,
    claim_id INTEGER REFERENCES claims(claim_id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('premium', 'claim_payout', 'refund')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    cashfree_txn_id VARCHAR(100),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('policy_created', 'policy_purchased', 'claim_submitted', 'claim_approved', 'claim_rejected', 'payment_received')),
    is_read BOOLEAN DEFAULT FALSE,
    related_id INTEGER, -- Can reference policy_id, claim_id, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_policy_templates_provider ON policy_templates(provider_id);
CREATE INDEX IF NOT EXISTS idx_policy_templates_type ON policy_templates(policy_type);
CREATE INDEX IF NOT EXISTS idx_policy_templates_active ON policy_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_policies_holder ON policies(holder_id);
CREATE INDEX IF NOT EXISTS idx_policies_provider ON policies(provider_id);
CREATE INDEX IF NOT EXISTS idx_policies_number ON policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_claims_policy ON claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_claims_holder ON claims(holder_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_number ON claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_policy ON payments(policy_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_templates_updated_at BEFORE UPDATE ON policy_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
