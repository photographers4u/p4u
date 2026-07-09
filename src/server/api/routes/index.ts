import { Hono } from "hono";
import { accountRouter } from "./account";
import { adminPhotographerRouter } from "./admin-photographer";
import { adminStaffRouter } from "./admin-staff";
import { bookmarkRouter } from "./bookmark";
import { notificationRouter } from "./notification";
import { photographerRouter } from "./photographer";
import { photographerContactRouter } from "./photographer-contact";
import { photographerEventRouter } from "./photographer-event";
import { photographerUploadRouter } from "./photographer-upload";
import { photographersRouter } from "./photographers";
import { specialitiesRouter } from "./specialities";
import { verificationRouter } from "./verification";

export const routes = new Hono()
  .route("/account", accountRouter)
  .route("/admin/photographers", adminPhotographerRouter)
  .route("/admin/staff", adminStaffRouter)
  .route("/bookmark", bookmarkRouter)
  .route("/notification", notificationRouter)
  .route("/photographer/contact", photographerContactRouter)
  .route("/photographer/event", photographerEventRouter)
  .route("/photographer", photographerRouter)
  .route("/photographer/uploads", photographerUploadRouter)
  .route("/photographers", photographersRouter)
  .route("/specialities", specialitiesRouter)
  .route("/verification", verificationRouter);

export type RoutesType = typeof routes;
