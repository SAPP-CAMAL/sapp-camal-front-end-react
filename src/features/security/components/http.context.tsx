"use client"

import { http } from "@/lib/ky";
import { createContext, useContext, useState } from "react";

const HttpContext = createContext({});

export function HttpProvider({ children }: { children: React.ReactNode }) {
  const [services] = useState(() => {
    return {
      // security: new SecurityService(http),
    };
  });

  return <HttpContext value={services}>{children}</HttpContext>;
}

export const useHttpServices = () => useContext(HttpContext);
