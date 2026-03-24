CREATE TABLE "admin_refresh_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_user_id" text NOT NULL,
	"family_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"replaced_by_session_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	"user_agent" text,
	"ip_address" text,
	CONSTRAINT "admin_refresh_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "role" varchar(32) DEFAULT 'super_admin' NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_refresh_sessions" ADD CONSTRAINT "admin_refresh_sessions_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_refresh_sessions" ADD CONSTRAINT "admin_refresh_sessions_replaced_by_session_id_admin_refresh_sessions_id_fk" FOREIGN KEY ("replaced_by_session_id") REFERENCES "public"."admin_refresh_sessions"("id") ON DELETE set null ON UPDATE no action;