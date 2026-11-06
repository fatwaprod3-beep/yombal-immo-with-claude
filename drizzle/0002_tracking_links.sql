CREATE TABLE IF NOT EXISTS "yombal_track_links" ("id" text PRIMARY KEY, "code" text NOT NULL UNIQUE, "name" text NOT NULL, "channel" text NOT NULL DEFAULT 'autre', "destination" text NOT NULL DEFAULT '/presentation', "cost" integer NOT NULL DEFAULT 0, "archived" integer NOT NULL DEFAULT 0, "created_at" text NOT NULL);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yombal_track_clicks" ("id" text PRIMARY KEY, "link_id" text NOT NULL, "visitor" text NOT NULL, "device" text, "created_at" text NOT NULL);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "yombal_track_clicks_link" ON "yombal_track_clicks" ("link_id","created_at");--> statement-breakpoint
ALTER TABLE "yombal_users" ADD COLUMN IF NOT EXISTS "ref_link_id" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "yombal_users_ref" ON "yombal_users" ("ref_link_id");
