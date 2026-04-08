/**
 * Domain error classes - framework-agnostic, thrown by controllers.
 * The tRPC layer maps these to HTTP error codes.
 */

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class InternalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InternalError";
  }
}
