-- Add currency_code to groups table
ALTER TABLE groups 
ADD COLUMN currency_code VARCHAR(3) DEFAULT 'USD';

-- Comment: Currencies supported will be handled by frontend formatting, 
-- but we default to USD for existing groups.
