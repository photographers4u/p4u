export class EmailSendError extends Error {
  constructor(
    public readonly template: string,
    public readonly to: string,
    public readonly cause: unknown,
  ) {
    super(`Failed to send "${template}" to ${to}`);
    this.name = "EmailSendError";
  }
}
