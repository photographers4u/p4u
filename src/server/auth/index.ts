import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, magicLink, openAPI } from "better-auth/plugins";
import { env } from "@/lib/env";
import db from "@/server/db";
import { account, session, user, verification } from "@/server/db/schema";
import { email } from "@/server/email";

export const auth = betterAuth({
  advanced: {
    database: {
      generateId: () => {
        return crypto.randomUUID();
      },
    },
  },
  plugins: [
    nextCookies(),
    openAPI(),
    admin(),
    magicLink({
      // emails
      sendMagicLink: async ({ email: to, url }) => {
        await email.sendMagicLink(to, { url });
      },
    }),
  ],
  basePath: "/api/auth",
  baseURL: env.NEXT_PUBLIC_BASE_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: user,
      account: account,
      session: session,
      verification: verification,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false,
      },
    },
    changeEmail: {
      enabled: true,

      // emails
      sendChangeEmailConfirmation: async ({ user, url, newEmail }) => {
        await email.sendEmailChange(user.email, {
          name: user.name,
          newEmail,
          url,
        });
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    // emails
    sendResetPassword: async ({ url, user }) => {
      await email.sendPasswordReset(user.email, { name: user.name, url });
    },
    onPasswordReset: async ({ user }) => {
      await email.sendPasswordResetSuccess(user.email, { name: user.name });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignIn: true,
    sendOnSignUp: true,

    // emails
    sendVerificationEmail: async ({ url, user }) => {
      await email.sendVerifyEmail(user.email, { name: user.name, url });
    },
    afterEmailVerification: async ({ name, email: userEmail }) => {
      await email.sendEmailVerified(userEmail, { name, email: userEmail });
    },
  },
});
