-- AlterTable
ALTER TABLE "User" ADD COLUMN     "teacherId" TEXT;

-- AlterTable
ALTER TABLE "result_approvals" ADD COLUMN     "approvedByTeacherId" TEXT,
ADD COLUMN     "approvedByTeacherName" TEXT,
ADD COLUMN     "rejectedByTeacherId" TEXT,
ADD COLUMN     "rejectedByTeacherName" TEXT,
ADD COLUMN     "submittedByTeacherId" TEXT,
ADD COLUMN     "submittedByTeacherName" TEXT;

-- AlterTable
ALTER TABLE "result_audit_logs" ADD COLUMN     "teacherFullName" TEXT,
ADD COLUMN     "teacherId" TEXT;

-- AlterTable
ALTER TABLE "teacher_activity_logs" ADD COLUMN     "teacherFullName" TEXT,
ADD COLUMN     "teacherId" TEXT;

-- CreateIndex
CREATE INDEX "result_approvals_submittedByTeacherId_submittedAt_idx" ON "result_approvals"("submittedByTeacherId", "submittedAt");

-- CreateIndex
CREATE INDEX "result_audit_logs_teacherId_timestamp_idx" ON "result_audit_logs"("teacherId", "timestamp");

-- CreateIndex
CREATE INDEX "teacher_activity_logs_teacherId_timestamp_idx" ON "teacher_activity_logs"("teacherId", "timestamp");
