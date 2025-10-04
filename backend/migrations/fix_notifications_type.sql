-- Fix notifications table type constraint to allow claim-related notification types

-- Drop existing constraint first
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Update any existing invalid notification types to 'general'
UPDATE notifications 
SET type = 'general' 
WHERE type NOT IN (
    'policy_purchased',
    'policy_sold',
    'policy_renewed',
    'policy_expired',
    'policy_cancelled',
    'new_claim',
    'claim_submitted',
    'claim_approved',
    'claim_rejected',
    'claim_settled',
    'claim_updated',
    'payment_received',
    'payment_pending',
    'payment_failed',
    'payment_refunded',
    'document_uploaded',
    'document_verified',
    'document_rejected',
    'ai_analysis_complete',
    'provider_review_required',
    'system_alert',
    'reminder',
    'general'
);

-- Add new constraint with all allowed notification types
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
    'policy_purchased',
    'policy_sold',
    'policy_renewed',
    'policy_expired',
    'policy_cancelled',
    'new_claim',
    'claim_submitted',
    'claim_approved',
    'claim_rejected',
    'claim_settled',
    'claim_updated',
    'payment_received',
    'payment_pending',
    'payment_failed',
    'payment_refunded',
    'document_uploaded',
    'document_verified',
    'document_rejected',
    'ai_analysis_complete',
    'provider_review_required',
    'system_alert',
    'reminder',
    'general'
));

COMMIT;
