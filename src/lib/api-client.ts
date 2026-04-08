import { hc } from "hono/client";
import type { RoutesType } from "@/server/api/routes";

export const apiClient = hc<RoutesType>("/api", {
  init: {
    credentials: "include",
  },
});
