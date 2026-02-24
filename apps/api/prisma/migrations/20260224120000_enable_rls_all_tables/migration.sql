-- Enable Row Level Security on all public tables
-- Since this app accesses the database exclusively through Prisma (postgres superuser),
-- the superuser bypasses RLS automatically. This migration satisfies Supabase security
-- requirements while maintaining full backend access.

-- Core models
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "supervisors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "manholes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "entry_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "incidents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "risk_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blockages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "alert_records" ENABLE ROW LEVEL SECURITY;

-- Safety feature models
ALTER TABLE "check_ins" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "checklists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gas_readings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "health_checks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shifts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "worker_certifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "maintenances" ENABLE ROW LEVEL SECURITY;

-- Public / compliance models
ALTER TABLE "grievances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- Offline sync
ALTER TABLE "sync_queue" ENABLE ROW LEVEL SECURITY;

-- SOS
ALTER TABLE "sos_records" ENABLE ROW LEVEL SECURITY;

-- Prisma internal
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Policies for the service_role (used by Supabase service key)
-- postgres superuser already bypasses RLS, but service_role
-- needs explicit policies if ever used via Supabase client SDK.
-- ============================================================

-- Helper: grant full CRUD to service_role on every table
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'users', 'supervisors', 'workers', 'manholes', 'entry_logs',
    'incidents', 'risk_logs', 'blockages', 'alert_records',
    'check_ins', 'checklists', 'gas_readings', 'health_checks',
    'shifts', 'tasks', 'worker_certifications', 'maintenances',
    'grievances', 'audit_logs', 'sync_queue', 'sos_records',
    '_prisma_migrations'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format(
      'CREATE POLICY "service_role_full_access" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      tbl
    );
  END LOOP;
END
$$;
