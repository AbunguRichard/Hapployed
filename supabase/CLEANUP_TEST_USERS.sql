-- Cleanup script to remove test users and their profiles
-- This allows reusing test emails

-- Delete worker profiles for test users
DELETE FROM worker_profiles 
WHERE email LIKE '%test%@test.com' 
   OR email LIKE '%testprofile%@example.com'
   OR email LIKE '%complete_profile_test%@test.com'
   OR email LIKE '%final_profile_test%@test.com'
   OR email LIKE '%profile_test%@test.com';

-- Delete test users
DELETE FROM users 
WHERE email LIKE '%test%@test.com'
   OR email LIKE '%testprofile%@example.com'
   OR email LIKE '%complete_profile_test%@test.com'
   OR email LIKE '%final_profile_test%@test.com'
   OR email LIKE '%profile_test%@test.com'
   OR email LIKE '%finaltest%@test.com'
   OR email LIKE '%test_signup_%@test.com';

-- Return count of deleted records
SELECT 
  'Cleanup complete. Test users and profiles deleted.' as message;
