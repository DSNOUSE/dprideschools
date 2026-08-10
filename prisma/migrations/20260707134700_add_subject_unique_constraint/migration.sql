-- Drop the old unique constraint if it exists
DROP INDEX IF EXISTS "Subject_name_departmentId_key";

-- Add the new unique constraint including section
CREATE UNIQUE INDEX IF NOT EXISTS "Subject_name_departmentId_section_key"
ON "Subject" (name, "departmentId", section);
