-- Database Migrations for OnlyPips Journal Monetization Feature

-- 1. Add has_supported field to users table
ALTER TABLE users 
ADD COLUMN has_supported BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN users.has_supported IS 'Flag indicating if user has supported via affiliate link';

-- 2. Create affiliate_info table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS affiliate_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    broker_name TEXT NOT NULL,
    link TEXT NOT NULL,
    logo_url TEXT,
    message_body TEXT NOT NULL,
    button_label TEXT NOT NULL DEFAULT 'Support via Broker',
    active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE affiliate_info IS 'Stores affiliate broker information for monetization';
COMMENT ON COLUMN affiliate_info.broker_name IS 'Name of the broker/affiliate partner';
COMMENT ON COLUMN affiliate_info.link IS 'Affiliate link URL';
COMMENT ON COLUMN affiliate_info.logo_url IS 'URL to broker logo image';
COMMENT ON COLUMN affiliate_info.message_body IS 'Support message to display to users';
COMMENT ON COLUMN affiliate_info.button_label IS 'Text for the support button';
COMMENT ON COLUMN affiliate_info.active IS 'Whether this affiliate info is currently active (only one should be active at a time)';

-- 3. Create updated_at trigger for affiliate_info table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_affiliate_info_updated_at 
    BEFORE UPDATE ON affiliate_info 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Create RLS policies for affiliate_info table
ALTER TABLE affiliate_info ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read active affiliate info
CREATE POLICY "Allow authenticated users to read active affiliate info" ON affiliate_info
    FOR SELECT USING (auth.role() = 'authenticated' AND active = true);

-- Allow only service role to manage affiliate info
CREATE POLICY "Allow service role to manage affiliate info" ON affiliate_info
    FOR ALL USING (auth.role() = 'service_role');

-- 5. Create RLS policies for users table has_supported field
-- Allow users to update their own has_supported field
CREATE POLICY "Allow users to update their own has_supported field" ON users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow users to read their own has_supported field
CREATE POLICY "Allow users to read their own has_supported field" ON users
    FOR SELECT USING (auth.uid() = id);

-- 6. Sample affiliate_info record (uncomment and modify as needed)
/*
INSERT INTO affiliate_info (
    broker_name,
    link,
    logo_url,
    message_body,
    button_label,
    active
) VALUES (
    'Your Broker Name',
    'https://your-affiliate-link.com',
    'https://your-logo-url.com/logo.png',
    'Support OnlyPips Journal by opening an account with our trusted broker partner. Your support helps us keep this platform free and continuously improve our features.',
    'Open Account & Support Us',
    true
);
*/

-- 7. Index for better performance
CREATE INDEX IF NOT EXISTS idx_affiliate_info_active ON affiliate_info(active);
CREATE INDEX IF NOT EXISTS idx_users_has_supported ON users(has_supported);

-- Add strategy column to trades table
ALTER TABLE trades ADD COLUMN IF NOT EXISTS strategy TEXT; 