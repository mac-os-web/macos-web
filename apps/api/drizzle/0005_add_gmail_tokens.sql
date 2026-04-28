CREATE TABLE "gmail_tokens" (
  "user_id" text PRIMARY KEY NOT NULL,
  "access_token_enc" text,
  "refresh_token_enc" text,
  "scope" text,
  "token_type" text,
  "expiry_date" timestamp with time zone,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gmail_tokens" ADD CONSTRAINT "gmail_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "public"."gmail_tokens" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'gmail_tokens' AND policyname = 'gmail_tokens_service_role_all'
  ) THEN
    CREATE POLICY gmail_tokens_service_role_all
      ON "public"."gmail_tokens"
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
