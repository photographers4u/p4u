import { relations } from "drizzle-orm";
import { boolean, index, text, uuid } from "drizzle-orm/pg-core";
import {
  eventTimestamptz,
  primaryKeyColumns,
  requiredManualTimestamptz,
  timestampColumns,
} from "../helpers/base-column";
import { createTable } from "../helpers/create-table";

export const user = createTable("user", {
  ...primaryKeyColumns(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: eventTimestamptz("ban_expires"),
  ...timestampColumns(),
});

export const session = createTable(
  "session",
  {
    ...primaryKeyColumns(),
    expiresAt: requiredManualTimestamptz("expires_at"),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    impersonatedBy: text("impersonated_by"),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestampColumns(),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = createTable(
  "account",
  {
    ...primaryKeyColumns(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: eventTimestamptz("access_token_expires_at"),
    refreshTokenExpiresAt: eventTimestamptz("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    ...timestampColumns(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = createTable(
  "verification",
  {
    ...primaryKeyColumns(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: requiredManualTimestamptz("expires_at"),
    ...timestampColumns(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
