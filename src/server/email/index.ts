export { EmailSendError } from "./errors";
export * from "./senders/auth";
export * from "./senders/review";

import * as authSenders from "./senders/auth";
import * as reviewSenders from "./senders/review";

export const email = { ...authSenders, ...reviewSenders };
