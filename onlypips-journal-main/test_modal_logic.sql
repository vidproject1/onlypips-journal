-- Test Modal Logic - Check Affiliate Info
-- Run these commands in your Supabase SQL editor

-- 1. Check if affiliate_info table exists and has data
SELECT 
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE active = true) as active_records,
    COUNT(*) FILTER (WHERE active = false) as inactive_records
FROM affiliate_info;

-- 2. Show all affiliate records
SELECT 
    id,
    broker_name,
    active,
    created_at,
    updated_at
FROM affiliate_info
ORDER BY created_at DESC;

-- 3. Show active affiliate details
SELECT 
    id,
    broker_name,
    link,
    logo_url,
    message_body,
    button_label,
    active
FROM affiliate_info
WHERE active = true;

-- 4. Check users table for has_supported field
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE has_supported = true) as users_who_supported,
    COUNT(*) FILTER (WHERE has_supported = false) as users_who_didnt_support
FROM users;

-- 5. If no active affiliate exists, create a test one
-- Uncomment and run this if no active affiliate is found:

/*
INSERT INTO affiliate_info (
    broker_name,
    link,
    logo_url,
    message_body,
    button_label,
    active
) VALUES (
    'Test Broker',
    'https://example.com',
    'https://via.placeholder.com/200x100?text=Broker+Logo',
    'Support OnlyPips Journal by opening an account with our trusted broker partner. Your support helps us keep this platform free and continuously improve our features.',
    'Open Account & Support Us',
    true
);
*/ 