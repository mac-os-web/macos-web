ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."mail_logs" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_service_role_all'
  ) THEN
    CREATE POLICY users_service_role_all
      ON "public"."users"
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sessions' AND policyname = 'sessions_service_role_all'
  ) THEN
    CREATE POLICY sessions_service_role_all
      ON "public"."sessions"
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'mail_logs' AND policyname = 'mail_logs_service_role_all'
  ) THEN
    CREATE POLICY mail_logs_service_role_all
      ON "public"."mail_logs"
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;