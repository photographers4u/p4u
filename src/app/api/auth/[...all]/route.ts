import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/server/auth";

// Better Auth's framework adapter stays as a direct app/api exception because
// it owns its own handler contract and cookie/session integration.
export const { POST, GET } = toNextJsHandler(auth);
