import { zValidator } from "@hono/zod-validator";
import { isAPIError } from "better-auth/api";
import { Hono } from "hono";
import { z } from "zod";
import {
  changeAccountEmail,
  getPendingEmailChangeState,
  resendAccountVerification,
  resolveEmailChangeConfirmationRedirectURL,
} from "@/server/account/email-change";
import {
  type ApiAuthEnv,
  requireAuth,
} from "@/server/api/lib/require-auth-middleware";
import { auth } from "@/server/auth";

const setPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});

const changeEmailSchema = z.object({
  newEmail: z.string().trim().email("Enter a valid email address."),
});

const confirmEmailChangeQuerySchema = z.object({
  token: z.string().min(1),
});

export const accountRouter = new Hono<ApiAuthEnv>()
  .get("/", requireAuth, async (c) => {
    const pendingEmailState = await getPendingEmailChangeState({
      headers: c.req.raw.headers,
    });

    if (pendingEmailState.kind === "unauthorized") {
      return c.body(null, 401);
    }

    return c.json(
      {
        pendingEmail: pendingEmailState.value.pendingEmail,
        user: c.get("user"),
      },
      200,
    );
  })
  .post(
    "/set-password",
    zValidator("json", setPasswordSchema),
    requireAuth,
    async (c) => {
      const { newPassword } = c.req.valid("json");

      try {
        await auth.api.setPassword({
          body: { newPassword },
          headers: c.req.raw.headers,
        });
      } catch (error) {
        if (isAPIError(error)) {
          const status =
            typeof error.statusCode === "number" ? error.statusCode : 400;

          return new Response(
            JSON.stringify({
              message:
                status >= 500
                  ? "Failed to set password."
                  : "Couldn't set a password for this account.",
            }),
            {
              status,
              headers: {
                "content-type": "application/json",
              },
            },
          );
        }

        return c.json(
          {
            message: "Failed to set password.",
          },
          500,
        );
      }

      return c.json({ status: true }, 200);
    },
  )
  .post(
    "/change-email",
    zValidator("json", changeEmailSchema),
    requireAuth,
    async (c) => {
      const result = await changeAccountEmail({
        body: c.req.valid("json"),
        headers: c.req.raw.headers,
      });

      if (result.kind === "unauthorized") {
        return c.body(null, 401);
      }

      if (result.kind === "error") {
        return c.json(
          {
            message: result.message,
          },
          result.statusCode,
        );
      }

      return c.json(
        {
          status: true,
          ...result.value,
        },
        200,
      );
    },
  )
  .post("/resend-verification", requireAuth, async (c) => {
    const result = await resendAccountVerification({
      headers: c.req.raw.headers,
    });

    if (result.kind === "unauthorized") {
      return c.body(null, 401);
    }

    if (result.kind === "error") {
      return c.json(
        {
          message: result.message,
        },
        result.statusCode,
      );
    }

    return c.json(
      {
        status: true,
        email: result.value.email,
      },
      200,
    );
  })
  .get(
    "/confirm-email-change",
    zValidator("query", confirmEmailChangeQuerySchema),
    async (c) => {
      const { token } = c.req.valid("query");
      const redirectURL = await resolveEmailChangeConfirmationRedirectURL({
        headers: c.req.raw.headers,
        token,
      });

      return c.redirect(redirectURL);
    },
  );
