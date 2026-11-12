GRANT SELECT, INSERT, UPDATE, DELETE ON "yombal_user_events" TO yombal_app;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "yombal_push_subscriptions" TO yombal_app;--> statement-breakpoint
DROP POLICY IF EXISTS yombal_app_all ON "yombal_user_events";--> statement-breakpoint
CREATE POLICY yombal_app_all ON "yombal_user_events" FOR ALL TO yombal_app USING (true) WITH CHECK (true);--> statement-breakpoint
DROP POLICY IF EXISTS yombal_app_all ON "yombal_push_subscriptions";--> statement-breakpoint
CREATE POLICY yombal_app_all ON "yombal_push_subscriptions" FOR ALL TO yombal_app USING (true) WITH CHECK (true);
