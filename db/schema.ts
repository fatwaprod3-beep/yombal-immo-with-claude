import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
export const workspaces = sqliteTable('yombal_workspaces', {
  userId: text('user_id').primaryKey(),
  data: text('data').notNull(),
  revision: integer('revision').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});
export const directories = sqliteTable('yombal_directories', { userId: text('user_id').primaryKey(), data: text('data').notNull() });
export const invoiceLinks = sqliteTable('yombal_invoice_links', { id: text('id').primaryKey(), userId: text('user_id').notNull(), spaceId: text('space_id').notNull(), leaseId: text('lease_id').notNull(), period: text('period').notNull(), token: text('token').notNull().unique(), data: text('data').notNull(), createdAt: text('created_at').notNull(), publication:text('publication').notNull().default('legacy') },table=>[uniqueIndex('yombal_invoice_bill').on(table.userId,table.spaceId,table.leaseId,table.period)]);
export const supportRequests = sqliteTable('yombal_support_requests', { id:text('id').primaryKey(), userId:text('user_id').notNull(), subject:text('subject').notNull(), email:text('email').notNull(), message:text('message').notNull(), createdAt:text('created_at').notNull() });
export const subscriptions=sqliteTable('yombal_subscriptions',{userId:text('user_id').primaryKey(),planId:text('plan_id').notNull(),status:text('status').notNull(),expiresAt:text('expires_at'),updatedAt:text('updated_at').notNull()});
export const subscriptionRequests=sqliteTable('yombal_subscription_requests',{id:text('id').primaryKey(),userId:text('user_id').notNull(),planId:text('plan_id').notNull(),amount:integer('amount').notNull(),status:text('status').notNull(),createdAt:text('created_at').notNull()});

export const adminAttempts=sqliteTable('yombal_admin_attempts',{userId:text('user_id').primaryKey(),attempts:integer('attempts').notNull().default(0),windowAt:integer('window_at').notNull()});

// Credentials are encrypted with a server-only key; never returned by a public API.
export const paymentConfig=sqliteTable('yombal_payment_config',{
 provider:text('provider').primaryKey(),apiKey:text('api_key').notNull(),webhookSecret:text('webhook_secret').notNull(),
 mode:text('mode').notNull(),verifiedAt:text('verified_at').notNull(),updatedAt:text('updated_at').notNull(),lastWebhookAt:text('last_webhook_at'),
});
export const billingCheckouts=sqliteTable('yombal_billing_checkouts',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),planId:text('plan_id').notNull(),amount:integer('amount').notNull(),currency:text('currency').notNull(),mode:text('mode').notNull(),
 status:text('status').notNull(),activeSlot:text('active_slot').unique(),providerSessionId:text('provider_session_id').unique(),providerPaymentId:text('provider_payment_id').unique(),checkoutUrl:text('checkout_url'),
 createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),expiresAt:text('expires_at').notNull(),lastCheckedAt:integer('last_checked_at').notNull().default(0),
},table=>[index('yombal_billing_user_status').on(table.userId,table.status)]);
// One successful provider transaction can extend one account exactly once.
export const billingPayments=sqliteTable('yombal_billing_payments',{
 providerPaymentId:text('provider_payment_id').primaryKey(),checkoutId:text('checkout_id').notNull().unique(),userId:text('user_id').notNull(),
 planId:text('plan_id').notNull(),amount:integer('amount').notNull(),currency:text('currency').notNull(),createdAt:text('created_at').notNull(),applied:integer('applied').notNull().default(0),
});

// Comptes Yombal (connexion e-mail + mot de passe, indépendante de tout fournisseur).
export const users=sqliteTable('yombal_users',{
 id:text('id').primaryKey(),email:text('email').notNull().unique(),name:text('name').notNull(),
 passwordHash:text('password_hash').notNull(),passwordSalt:text('password_salt').notNull(),createdAt:text('created_at').notNull(),
});
