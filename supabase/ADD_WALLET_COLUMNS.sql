-- Add missing columns to wallets table for comprehensive wallet system

ALTER TABLE wallets 
ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(10, 2) DEFAULT 65000,
ADD COLUMN IF NOT EXISTS credit_used DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS savings_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS savings_balance DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS savings_interest_rate DECIMAL(5, 2) DEFAULT 2.5;

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'wallets' 
ORDER BY ordinal_position;
