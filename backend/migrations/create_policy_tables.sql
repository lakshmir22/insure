-- Create policy_templates table
CREATE TABLE IF NOT EXISTS policy_templates (
    template_id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    policy_type VARCHAR(50) NOT NULL CHECK (policy_type IN ('Health', 'Vehicle', 'Life', 'Travel', 'Property')),
    coverage_amount DECIMAL(15,2) NOT NULL CHECK (coverage_amount > 0),
    premium DECIMAL(15,2) NOT NULL CHECK (premium > 0),
    insurance_exp_date DATE NOT NULL,
    max_claims_per_year INTEGER NOT NULL DEFAULT 1 CHECK (max_claims_per_year > 0),
    description TEXT NOT NULL,
    terms_and_conditions TEXT NOT NULL,
    blockchain_template_id VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create policies table (purchased policies)
CREATE TABLE IF NOT EXISTS policies (
    policy_id SERIAL PRIMARY KEY,
    policy_number VARCHAR(100) UNIQUE NOT NULL,
    template_id INTEGER REFERENCES policy_templates(template_id) ON DELETE RESTRICT,
    holder_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    policy_type VARCHAR(50) NOT NULL,
    coverage_amount DECIMAL(15,2) NOT NULL,
    premium DECIMAL(15,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'claimed')),
    blockchain_policy_id VARCHAR(100),
    blockchain_tx_hash VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table if not exists
CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    policy_id INTEGER REFERENCES policies(policy_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('premium', 'claim_payout', 'refund')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    cashfree_txn_id VARCHAR(100),
    cashfree_order_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    related_id INTEGER,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_policy_templates_provider ON policy_templates(provider_id);
CREATE INDEX IF NOT EXISTS idx_policy_templates_active ON policy_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_policies_holder ON policies(holder_id);
CREATE INDEX IF NOT EXISTS idx_policies_provider ON policies(provider_id);
CREATE INDEX IF NOT EXISTS idx_policies_template ON policies(template_id);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_payments_policy ON payments(policy_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_policy_templates_updated_at ON policy_templates;
CREATE TRIGGER update_policy_templates_updated_at 
    BEFORE UPDATE ON policy_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_policies_updated_at ON policies;
CREATE TRIGGER update_policies_updated_at 
    BEFORE UPDATE ON policies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
