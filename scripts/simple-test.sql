-- SQL to update admin user with teacher ID
-- Run this in your Neon database console

UPDATE "User" 
SET "teacherId" = 'ADMIN001' 
WHERE email = 'admin@dprideschools.com';

-- Verify the update
SELECT id, email, name, "teacherId" 
FROM "User" 
WHERE email = 'admin@dprideschools.com';
