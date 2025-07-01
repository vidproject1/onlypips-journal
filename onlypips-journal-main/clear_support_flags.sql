-- Clear Support Modal Flags for All Users
-- Run these commands in your Supabase SQL editor

-- 1. Reset has_supported field for all users
UPDATE users 
SET has_supported = false 
WHERE has_supported = true;

-- 2. Show how many users were affected
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE has_supported = true) as users_who_supported,
    COUNT(*) FILTER (WHERE has_supported = false) as users_who_didnt_support
FROM users;

-- 3. Optional: Show users who had supported (for reference)
SELECT 
    id,
    created_at,
    has_supported
FROM users 
WHERE has_supported = true
ORDER BY created_at DESC;

-- Note: This only clears the database flags.
-- Users will still have localStorage flags until they clear their browser data
-- or you can provide them with a way to reset their localStorage. 