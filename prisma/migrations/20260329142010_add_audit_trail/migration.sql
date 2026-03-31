/*
  Warnings:

  - You are about to drop the column `comment` on the `Result` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Result" DROP COLUMN "comment";

-- CreateTable
CREATE TABLE "result_audit_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB NOT NULL,
    "changedFields" TEXT[],
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "classId" INTEGER,
    "studentId" TEXT,
    "subjectId" INTEGER,
    "termId" INTEGER,
    "sessionIdAcademic" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'WEB',
    "batchId" TEXT,
    "notes" TEXT,

    CONSTRAINT "result_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "duration" INTEGER,
    "recordsAffected" INTEGER,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "sessionId" TEXT NOT NULL,
    "classId" INTEGER,
    "termId" INTEGER,
    "sessionIdAcademic" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_approvals" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityTypeFull" TEXT NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "classId" INTEGER,
    "studentId" TEXT,
    "termId" INTEGER,
    "sessionIdAcademic" INTEGER,
    "submitterNotes" TEXT,
    "approverNotes" TEXT,

    CONSTRAINT "result_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "result_audit_logs_entityType_entityId_idx" ON "result_audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "result_audit_logs_userId_timestamp_idx" ON "result_audit_logs"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "result_audit_logs_classId_timestamp_idx" ON "result_audit_logs"("classId", "timestamp");

-- CreateIndex
CREATE INDEX "result_audit_logs_studentId_timestamp_idx" ON "result_audit_logs"("studentId", "timestamp");

-- CreateIndex
CREATE INDEX "result_audit_logs_timestamp_idx" ON "result_audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "teacher_activity_logs_userId_timestamp_idx" ON "teacher_activity_logs"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "teacher_activity_logs_action_timestamp_idx" ON "teacher_activity_logs"("action", "timestamp");

-- CreateIndex
CREATE INDEX "teacher_activity_logs_classId_timestamp_idx" ON "teacher_activity_logs"("classId", "timestamp");

-- CreateIndex
CREATE INDEX "result_approvals_status_submittedAt_idx" ON "result_approvals"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "result_approvals_submittedBy_submittedAt_idx" ON "result_approvals"("submittedBy", "submittedAt");

-- CreateIndex
CREATE INDEX "result_approvals_classId_status_idx" ON "result_approvals"("classId", "status");

-- AddForeignKey
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_audit_logs" ADD CONSTRAINT "result_audit_logs_sessionIdAcademic_fkey" FOREIGN KEY ("sessionIdAcademic") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_activity_logs" ADD CONSTRAINT "teacher_activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_activity_logs" ADD CONSTRAINT "teacher_activity_logs_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_approvals" ADD CONSTRAINT "result_approvals_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_approvals" ADD CONSTRAINT "result_approvals_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_approvals" ADD CONSTRAINT "result_approvals_rejectedBy_fkey" FOREIGN KEY ("rejectedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
