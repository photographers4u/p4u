import { Hono } from "hono";
import { accountRouter } from "./account";
import { bookmarkRouter } from "./bookmark";
import { itemRouter } from "./item";
import { photographerContactRouter } from "./photographer-contact";
import { photographerRouter } from "./photographer";
import { photographersRouter } from "./photographers";

export const routes = new Hono()
  .route("/account", accountRouter)
  .route("/bookmark", bookmarkRouter)
  .route("/item", itemRouter)
  .route("/photographer/contact", photographerContactRouter)
  .route("/photographer", photographerRouter)
  .route("/photographers", photographersRouter);

export type RoutesType = typeof routes;
