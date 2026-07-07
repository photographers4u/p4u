"use client";

import NextTopLoader from "nextjs-toploader";
import type React from "react";
import { NotificationsProvider } from "@/lib/notifications-context";
import { Toaster } from "./ui/sonner";

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <NextTopLoader color="#1f6cf0" showSpinner={false} />
      <NotificationsProvider>{children}</NotificationsProvider>
      <Toaster position="top-center" />
    </>
  );
};

export default ClientProvider;
