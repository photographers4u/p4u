export { zValidator as zodValidator } from "@hono/zod-validator";

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "@/server/db/helpers/errors";

type RouteErrorStatus = 400 | 403 | 404 | 409 | 500;

export function mapError(
  error: unknown,
): [status: RouteErrorStatus, message: string] {
  if (error instanceof BadRequestError) {
    return [400, error.message];
  }

  if (error instanceof ForbiddenError) {
    return [403, error.message];
  }

  if (error instanceof NotFoundError) {
    return [404, error.message];
  }

  if (error instanceof ConflictError) {
    return [409, error.message];
  }

  if (error instanceof InternalError) {
    return [500, error.message];
  }

  return [500, "Something went wrong"];
}
