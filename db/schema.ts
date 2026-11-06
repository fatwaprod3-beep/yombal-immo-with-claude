import { pgTable, text, integer, bigint, uniqueIndex, index } from 'drizzle-orm/pg-core';
export const workspaces = pgTable('yombal_workspaces', {
  userId: text('user_id').primaryKey(),
  data: text('data').notNull(),
  revision: integer('revision').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});
export const directories = pgTable('yombal_directories', { userId: text('user_id').primaryKey(), data: text('data').notNull() });
export const invoiceLinks = pgTable('yombal_invoice_links', { id: text('id').primaryKey(), userId: text('user_id').notNull(), spaceId: text('space_id').notNull(), leaseId: text('lease_id').notNull(), period: text('period').notNull(), token: text('token').notNull().unique(), data: text('data').notNull(), createdAt: text('created_at').notNull(), publication:text('publication').notNull().default('legacy') },table=>[uniqueIndex('yombal_invoice_bill').on(table.userId,table.spaceId,table.leaseId,table.period)]);
export const supportRequests = pgTable('yombal_support_requests', { id:text('id').primaryKey(), userId:text('user_id').notNull(), subject:text('subject').notNull(), email:text('email').notNull(), message:text('message').notNull(), createdAt:text('created_at').notNull() });
export const subscriptions=pgTable('yombal_subscriptions',{userId:text('user_id').primaryKey(),planId:text('plan_id').notNull(),status:text('status').notNull(),expiresAt:text('expires_at'),updatedAt:text('updated_at').notNull()});
export const subscriptionRequests=pgTable('yombal_subscription_requests',{id:text('id').primaryKey(),userId:text('user_id').notNull(),planId:text('plan_id').notNull(),amount:integer('amount').notNull(),status:text('status').notNull(),createdAt:text('created_at').notNull()});

export const adminAttempts=pgTable('yombal_admin_attempts',{userId:text('user_id').primaryKey(),attempts:integer('attempts').notNull().default(0),windowAt:bigint('window_at',{mode:'number'}).notNull()});

// Credentials are encrypted with a server-only key; never returned by a public API.
export const paymentConfig=pgTable('yombal_payment_config',{
 provider:text('provider').primaryKey(),apiKey:text('api_key').notNull(),webhookSecret:text('webhook_secret').notNull(),
 mode:text('mode').notNull(),verifiedAt:text('verified_at').notNull(),updatedAt:text('updated_at').notNull(),lastWebhookAt:text('last_webhook_at'),
});
export const billingCheckouts=pgTable('yombal_billing_checkouts',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),planId:text('plan_id').notNull(),amount:integer('amount').notNull(),currency:text('currency').notNull(),mode:text('mode').notNull(),
 status:text('status').notNull(),activeSlot:text('active_slot').unique(),providerSessionId:text('provider_session_id').unique(),providerPaymentId:text('provider_payment_id').unique(),checkoutUrl:text('checkout_url'),
 createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),expiresAt:text('expires_at').notNull(),lastCheckedAt:bigint('last_checked_at',{mode:'number'}).notNull().default(0),
},table=>[index('yombal_billing_user_status').on(table.userId,table.status)]);
// One successful provider transaction can extend one account exactly once.
export const billingPayments=pgTable('yombal_billing_payments',{
 providerPaymentId:text('provider_payment_id').primaryKey(),checkoutId:text('checkout_id').notNull().unique(),userId:text('user_id').notNull(),
 planId:text('plan_id').notNull(),amount:integer('amount').notNull(),currency:text('currency').notNull(),createdAt:text('created_at').notNull(),applied:integer('applied').notNull().default(0),
});

// Comptes Yombal (connexion e-mail + mot de passe, indépendante de tout fournisseur).
export const users=pgTable('yombal_users',{
 id:text('id').primaryKey(),email:text('email').notNull().unique(),name:text('name').notNull(),
 passwordHash:text('password_hash').notNull(),passwordSalt:text('password_salt').notNull(),createdAt:text('created_at').notNull(),
 status:text('status').notNull().default('active'),lastSeenAt:text('last_seen_at'),lastLoginAt:text('last_login_at'),sessionsAfter:bigint('sessions_after',{mode:'number'}).notNull().default(0),refLinkId:text('ref_link_id'),
});

// Journal de sécurité : connexions échouées, blocages, actions administrateur, messages signalés.
export const securityEvents=pgTable('yombal_security_events',{id:text('id').primaryKey(),kind:text('kind').notNull(),email:text('email'),userId:text('user_id'),ip:text('ip'),userAgent:text('user_agent'),detail:text('detail'),createdAt:text('created_at').notNull()},table=>[index('yombal_security_created').on(table.createdAt)]);
// Réglages globaux pilotés depuis l'administration (inscriptions, maintenance, assistant…).
export const appSettings=pgTable('yombal_app_settings',{key:text('key').primaryKey(),value:text('value').notNull(),updatedAt:text('updated_at').notNull()});
// Assistant IA : conversations et messages conservés pour la modération.
export const aiConversations=pgTable('yombal_ai_conversations',{id:text('id').primaryKey(),userId:text('user_id').notNull(),title:text('title').notNull(),flagged:integer('flagged').notNull().default(0),flagReason:text('flag_reason'),messageCount:integer('message_count').notNull().default(0),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()},table=>[index('yombal_ai_conv_user').on(table.userId,table.updatedAt)]);
export const aiMessages=pgTable('yombal_ai_messages',{id:text('id').primaryKey(),conversationId:text('conversation_id').notNull(),userId:text('user_id').notNull(),role:text('role').notNull(),content:text('content').notNull(),flagged:integer('flagged').notNull().default(0),createdAt:text('created_at').notNull()},table=>[index('yombal_ai_msg_conv').on(table.conversationId,table.createdAt),index('yombal_ai_msg_user').on(table.userId,table.createdAt)]);

// Liens de suivi (influenceurs, publicités) : clics, inscriptions et abonnements attribués.
export const trackLinks=pgTable('yombal_track_links',{id:text('id').primaryKey(),code:text('code').notNull().unique(),name:text('name').notNull(),channel:text('channel').notNull().default('autre'),destination:text('destination').notNull().default('/presentation'),cost:integer('cost').notNull().default(0),archived:integer('archived').notNull().default(0),createdAt:text('created_at').notNull()});
export const trackClicks=pgTable('yombal_track_clicks',{id:text('id').primaryKey(),linkId:text('link_id').notNull(),visitor:text('visitor').notNull(),device:text('device'),createdAt:text('created_at').notNull()},table=>[index('yombal_track_clicks_link').on(table.linkId,table.createdAt)]);
