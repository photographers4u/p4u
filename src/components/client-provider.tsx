"use client";

import dynamic from "next/dynamic";
import type React from "react";
import { NotificationsProvider } from "@/lib/notifications-context";
import { Toaster } from "./ui/sonner";

const NextTopLoader = dynamic(() => import("nextjs-toploader"), {
  ssr: false,
});

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
