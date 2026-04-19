"use client";

import React from "react";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "./ui/sonner";

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <NextTopLoader color="#1f6cf0" showSpinner={false} />
      {children}
      <Toaster position="top-center" />
    </>
  );
};

export default ClientProvider;
