-- ============================================
-- CLEANUP ALL INCOMPLETE REGISTRATIONS
-- Run this in Supabase SQL Editor
-- ============================================

-- This will delete ALL test/incomplete registrations
-- Be careful in production!

-- Option 1: Delete specific email
-- Replace 'YOUR_EMAIL_HERE' with the actual stuck email

DELETE FROM worker_profiles WHERE user_id IN (
  SELECT id FROM users WHERE email = 'YOUR_EMAIL_HERE'
);

DELETE FROM users WHERE email = 'YOUR_EMAIL_HERE';

-- Confirm deletion
SELECT 'Cleanup complete for YOUR_EMAIL_HERE' as status;


-- ============================================
-- Option 2: Delete ALL test emails (if needed)
-- Uncomment lines below to use
-- ============================================

-- DELETE FROM worker_profiles WHERE user_id IN (
--   SELECT id FROM users WHERE email LIKE '%test%' OR email LIKE '%@demo.com'
-- );

-- DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%@demo.com';

-- SELECT 'All test accounts deleted' as status;
