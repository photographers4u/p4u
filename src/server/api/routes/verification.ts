import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  getPublicRegistrationEmailStatus,
  resendVerificationEmailForPublicUser,
} from "@/server/account/email-verification";

const publicEmailSchema = z.object({
  callbackURL: z.string().optional(),
  email: z.string().trim().email("Enter a valid email address."),
});

const registrationStatusSchema = publicEmailSchema.omit({
  callbackURL: true,
});

export const verificationRouter = new Hono()
  .post(
    "/register-status",
    zValidator("json", registrationStatusSchema),
    async (c) => {
      const { email } = c.req.valid("json");
      const status = await getPublicRegistrationEmailStatus({ email });

      return c.json(
        {
          status,
        },
        200,
      );
    },
  )
  .post("/resend-email", zValidator("json", publicEmailSchema), async (c) => {
    const { callbackURL, email } = c.req.valid("json");
    const result = await resendVerificationEmailForPublicUser({
      callbackURL,
      email,
    });

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
      },
      200,
    );
  });
