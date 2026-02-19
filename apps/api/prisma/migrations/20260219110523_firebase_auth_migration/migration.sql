-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('SAFE', 'CAUTION', 'PROHIBITED');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('ACTIVE', 'EXITED', 'OVERSTAY_ALERT');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('WORKER', 'SUPERVISOR', 'ADMIN', 'CITIZEN');

-- CreateEnum
CREATE TYPE "EntryState" AS ENUM ('IDLE', 'SCANNED', 'CHECKLIST_PENDING', 'ENTERED', 'ACTIVE', 'EXITED', 'OVERSTAY_ALERT', 'SOS_TRIGGERED', 'GAS_ALERT', 'CHECKIN_MISSED');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXCEEDED_LIMIT');

-- CreateEnum
CREATE TYPE "GrievanceStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CertificationType" AS ENUM ('SAFETY_TRAINING', 'CONFINED_SPACE', 'FIRST_AID', 'GAS_DETECTION', 'PPE_USAGE', 'MEDICAL_FITNESS');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SCAN', 'ENTRY_START', 'ENTRY_EXIT', 'ALERT_TRIGGERED', 'ALERT_ACKNOWLEDGED', 'SOS_ACTIVATED', 'CHECKIN_RESPONSE', 'CHECKIN_MISSED', 'REPORT_GENERATED', 'SETTING_CHANGED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "firebase_uid" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'WORKER',
    "language" TEXT NOT NULL DEFAULT 'en',
    "push_subscription" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervisors" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "area" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supervisors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "employee_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "supervisor_id" UUID,
    "date_of_birth" TIMESTAMP(3),
    "blood_group" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "medical_notes" TEXT,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manholes" (
    "id" UUID NOT NULL,
    "qr_code_id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "area" TEXT NOT NULL,
    "address" TEXT,
    "depth" DOUBLE PRECISION DEFAULT 0,
    "diameter" DOUBLE PRECISION DEFAULT 0,
    "max_workers" INTEGER NOT NULL DEFAULT 2,
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'SAFE',
    "risk_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "geo_fence_radius" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "last_cleaned_at" TIMESTAMP(3),
    "next_maintenance_at" TIMESTAMP(3),
    "has_gas_sensor" BOOLEAN NOT NULL DEFAULT false,
    "sensor_device_id" TEXT,
    "nearest_hospital" TEXT,
    "nearest_hospital_dist" DOUBLE PRECISION,
    "nearest_fire_station" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manholes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entry_logs" (
    "id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "manhole_id" UUID NOT NULL,
    "task_id" UUID,
    "shift_id" UUID,
    "entry_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exit_time" TIMESTAMP(3),
    "allowed_duration_minutes" INTEGER NOT NULL DEFAULT 45,
    "status" "EntryStatus" NOT NULL DEFAULT 'ACTIVE',
    "state" "EntryState" NOT NULL DEFAULT 'ENTERED',
    "geo_latitude" DOUBLE PRECISION,
    "geo_longitude" DOUBLE PRECISION,
    "geo_verified" BOOLEAN NOT NULL DEFAULT false,
    "checklist_completed" BOOLEAN NOT NULL DEFAULT false,
    "team_entry_id" UUID,
    "is_offline_entry" BOOLEAN NOT NULL DEFAULT false,
    "synced_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entry_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" UUID NOT NULL,
    "manhole_id" UUID NOT NULL,
    "worker_id" UUID,
    "entry_log_id" UUID,
    "incident_type" TEXT NOT NULL,
    "description" TEXT,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" UUID,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_logs" (
    "id" UUID NOT NULL,
    "manhole_id" UUID NOT NULL,
    "risk_score" DOUBLE PRECISION NOT NULL,
    "blockage_freq" DOUBLE PRECISION NOT NULL,
    "incident_count" INTEGER NOT NULL,
    "rainfall_factor" DOUBLE PRECISION NOT NULL,
    "area_risk" DOUBLE PRECISION NOT NULL,
    "gas_factor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weather_factor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "computed_level" "RiskLevel" NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockages" (
    "id" UUID NOT NULL,
    "manhole_id" UUID NOT NULL,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'LOW',

    CONSTRAINT "blockages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_records" (
    "id" UUID NOT NULL,
    "entry_log_id" UUID NOT NULL,
    "alert_type" TEXT NOT NULL,
    "sent_to" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" TEXT NOT NULL DEFAULT 'push',
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_at" TIMESTAMP(3),
    "acknowledged_by" UUID,

    CONSTRAINT "alert_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" UUID NOT NULL,
    "entry_log_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "prompted_at" TIMESTAMP(3) NOT NULL,
    "responded_at" TIMESTAMP(3),
    "was_on_time" BOOLEAN NOT NULL DEFAULT false,
    "method" TEXT NOT NULL DEFAULT 'tap',

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklists" (
    "id" UUID NOT NULL,
    "entry_log_id" UUID NOT NULL,
    "items" JSONB NOT NULL,
    "all_passed" BOOLEAN NOT NULL DEFAULT false,
    "supervisor_approved" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gas_readings" (
    "id" UUID NOT NULL,
    "manhole_id" UUID NOT NULL,
    "h2s" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ch4" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "co" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "o2" DOUBLE PRECISION NOT NULL DEFAULT 20.9,
    "co2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nh3" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "is_dangerous" BOOLEAN NOT NULL DEFAULT false,
    "alert_triggered" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'sensor',
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gas_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_checks" (
    "id" UUID NOT NULL,
    "entry_log_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "feeling_ok" BOOLEAN NOT NULL,
    "symptoms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "photo_url" TEXT,
    "notes" TEXT,
    "needs_medical" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "status" "ShiftStatus" NOT NULL DEFAULT 'ACTIVE',
    "entry_count" INTEGER NOT NULL DEFAULT 0,
    "total_underground_minutes" INTEGER NOT NULL DEFAULT 0,
    "breaks_taken" INTEGER NOT NULL DEFAULT 0,
    "fatigue_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "supervisor_id" UUID NOT NULL,
    "manhole_id" UUID,
    "assigned_worker_ids" TEXT[],
    "task_type" TEXT NOT NULL,
    "description" TEXT,
    "allowed_duration" INTEGER NOT NULL DEFAULT 45,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduled_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_certifications" (
    "id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "type" "CertificationType" NOT NULL,
    "certificate_number" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "issued_by" TEXT,
    "document_url" TEXT,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenances" (
    "id" UUID NOT NULL,
    "manhole_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "assigned_team" TEXT,
    "notes" TEXT,
    "auto_generated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grievances" (
    "id" UUID NOT NULL,
    "manhole_id" UUID,
    "reporter_name" TEXT NOT NULL,
    "reporter_phone" TEXT NOT NULL,
    "reporter_email" TEXT,
    "issue_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "address" TEXT,
    "photo_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "GrievanceStatus" NOT NULL DEFAULT 'SUBMITTED',
    "tracking_code" TEXT NOT NULL,
    "assigned_to" UUID,
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grievances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" "AuditAction" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "hash_chain" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_queue" (
    "id" UUID NOT NULL,
    "device_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_at" TIMESTAMP(3),
    "sync_status" TEXT NOT NULL DEFAULT 'pending',
    "conflict_data" JSONB,

    CONSTRAINT "sync_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sos_records" (
    "id" UUID NOT NULL,
    "entry_log_id" UUID,
    "worker_id" UUID NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "trigger_method" TEXT NOT NULL,
    "nearest_hospital" TEXT,
    "hospital_distance" DOUBLE PRECISION,
    "nearest_fire_station" TEXT,
    "responded_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "outcome" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sos_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "supervisors_user_id_key" ON "supervisors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "workers_user_id_key" ON "workers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "workers_employee_id_key" ON "workers"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "manholes_qr_code_id_key" ON "manholes"("qr_code_id");

-- CreateIndex
CREATE INDEX "manholes_area_idx" ON "manholes"("area");

-- CreateIndex
CREATE INDEX "manholes_risk_level_idx" ON "manholes"("risk_level");

-- CreateIndex
CREATE INDEX "entry_logs_status_idx" ON "entry_logs"("status");

-- CreateIndex
CREATE INDEX "entry_logs_worker_id_idx" ON "entry_logs"("worker_id");

-- CreateIndex
CREATE INDEX "entry_logs_manhole_id_idx" ON "entry_logs"("manhole_id");

-- CreateIndex
CREATE INDEX "entry_logs_entry_time_idx" ON "entry_logs"("entry_time");

-- CreateIndex
CREATE INDEX "entry_logs_team_entry_id_idx" ON "entry_logs"("team_entry_id");

-- CreateIndex
CREATE INDEX "incidents_severity_idx" ON "incidents"("severity");

-- CreateIndex
CREATE INDEX "incidents_manhole_id_idx" ON "incidents"("manhole_id");

-- CreateIndex
CREATE INDEX "incidents_timestamp_idx" ON "incidents"("timestamp");

-- CreateIndex
CREATE INDEX "risk_logs_manhole_id_idx" ON "risk_logs"("manhole_id");

-- CreateIndex
CREATE INDEX "risk_logs_calculated_at_idx" ON "risk_logs"("calculated_at");

-- CreateIndex
CREATE INDEX "blockages_manhole_id_idx" ON "blockages"("manhole_id");

-- CreateIndex
CREATE INDEX "alert_records_entry_log_id_idx" ON "alert_records"("entry_log_id");

-- CreateIndex
CREATE INDEX "alert_records_sent_at_idx" ON "alert_records"("sent_at");

-- CreateIndex
CREATE INDEX "check_ins_entry_log_id_idx" ON "check_ins"("entry_log_id");

-- CreateIndex
CREATE INDEX "check_ins_worker_id_idx" ON "check_ins"("worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "checklists_entry_log_id_key" ON "checklists"("entry_log_id");

-- CreateIndex
CREATE INDEX "gas_readings_manhole_id_idx" ON "gas_readings"("manhole_id");

-- CreateIndex
CREATE INDEX "gas_readings_read_at_idx" ON "gas_readings"("read_at");

-- CreateIndex
CREATE INDEX "gas_readings_is_dangerous_idx" ON "gas_readings"("is_dangerous");

-- CreateIndex
CREATE UNIQUE INDEX "health_checks_entry_log_id_key" ON "health_checks"("entry_log_id");

-- CreateIndex
CREATE INDEX "health_checks_worker_id_idx" ON "health_checks"("worker_id");

-- CreateIndex
CREATE INDEX "shifts_worker_id_idx" ON "shifts"("worker_id");

-- CreateIndex
CREATE INDEX "shifts_status_idx" ON "shifts"("status");

-- CreateIndex
CREATE INDEX "tasks_supervisor_id_idx" ON "tasks"("supervisor_id");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "worker_certifications_worker_id_idx" ON "worker_certifications"("worker_id");

-- CreateIndex
CREATE INDEX "worker_certifications_expires_at_idx" ON "worker_certifications"("expires_at");

-- CreateIndex
CREATE INDEX "maintenances_manhole_id_idx" ON "maintenances"("manhole_id");

-- CreateIndex
CREATE INDEX "maintenances_status_idx" ON "maintenances"("status");

-- CreateIndex
CREATE INDEX "maintenances_scheduled_at_idx" ON "maintenances"("scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "grievances_tracking_code_key" ON "grievances"("tracking_code");

-- CreateIndex
CREATE INDEX "grievances_status_idx" ON "grievances"("status");

-- CreateIndex
CREATE INDEX "grievances_tracking_code_idx" ON "grievances"("tracking_code");

-- CreateIndex
CREATE INDEX "grievances_created_at_idx" ON "grievances"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "sync_queue_device_id_idx" ON "sync_queue"("device_id");

-- CreateIndex
CREATE INDEX "sync_queue_sync_status_idx" ON "sync_queue"("sync_status");

-- CreateIndex
CREATE INDEX "sos_records_worker_id_idx" ON "sos_records"("worker_id");

-- CreateIndex
CREATE INDEX "sos_records_created_at_idx" ON "sos_records"("created_at");

-- AddForeignKey
ALTER TABLE "supervisors" ADD CONSTRAINT "supervisors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_logs" ADD CONSTRAINT "entry_logs_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_logs" ADD CONSTRAINT "entry_logs_manhole_id_fkey" FOREIGN KEY ("manhole_id") REFERENCES "manholes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_logs" ADD CONSTRAINT "entry_logs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_logs" ADD CONSTRAINT "entry_logs_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_manhole_id_fkey" FOREIGN KEY ("manhole_id") REFERENCES "manholes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_logs" ADD CONSTRAINT "risk_logs_manhole_id_fkey" FOREIGN KEY ("manhole_id") REFERENCES "manholes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockages" ADD CONSTRAINT "blockages_manhole_id_fkey" FOREIGN KEY ("manhole_id") REFERENCES "manholes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_entry_log_id_fkey" FOREIGN KEY ("entry_log_id") REFERENCES "entry_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklists" ADD CONSTRAINT "checklists_entry_log_id_fkey" FOREIGN KEY ("entry_log_id") REFERENCES "entry_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gas_readings" ADD CONSTRAINT "gas_readings_manhole_id_fkey" FOREIGN KEY ("manhole_id") REFERENCES "manholes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_checks" ADD CONSTRAINT "health_checks_entry_log_id_fkey" FOREIGN KEY ("entry_log_id") REFERENCES "entry_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_checks" ADD CONSTRAINT "health_checks_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_certifications" ADD CONSTRAINT "worker_certifications_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_manhole_id_fkey" FOREIGN KEY ("manhole_id") REFERENCES "manholes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_manhole_id_fkey" FOREIGN KEY ("manhole_id") REFERENCES "manholes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
