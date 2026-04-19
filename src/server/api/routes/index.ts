import { Hono } from "hono";
import { accountRouter } from "./account";
import { bookmarkRouter } from "./bookmark";
import { photographerRouter } from "./photographer";
import { photographerContactRouter } from "./photographer-contact";
import { photographerUploadRouter } from "./photographer-upload";
import { photographersRouter } from "./photographers";
import { specialitiesRouter } from "./specialities";

export const routes = new Hono()
  .route("/account", accountRouter)
  .route("/bookmark", bookmarkRouter)
  .route("/photographer/contact", photographerContactRouter)
  .route("/photographer", photographerRouter)
  .route("/photographer/uploads", photographerUploadRouter)
  .route("/photographers", photographersRouter)
  .route("/specialities", specialitiesRouter);

export type RoutesType = typeof routes;
