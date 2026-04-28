CREATE TABLE "mail_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"sender_user_id" text NOT NULL,
	"recipient_email_encrypted" text NOT NULL,
	"recipient_email_hash" text NOT NULL,
	"provider" text NOT NULL,
	"provider_message_id" text,
	"status" text NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "mail_logs_sender_user_id_idx" ON "mail_logs" USING btree ("sender_user_id");--> statement-breakpoint
CREATE INDEX "mail_logs_recipient_email_hash_idx" ON "mail_logs" USING btree ("recipient_email_hash");--> statement-breakpoint
CREATE INDEX "mail_logs_created_at_idx" ON "mail_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");