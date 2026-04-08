import { Hono } from "hono";
import { accountRouter } from "./account";
import { bookmarkRouter } from "./bookmark";
import { itemRouter } from "./item";

export const routes = new Hono()
  .route("/account", accountRouter)
  .route("/bookmark", bookmarkRouter)
  .route("/item", itemRouter);

export type RoutesType = typeof routes;
