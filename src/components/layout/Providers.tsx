"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthGateProvider } from "@/components/auth/AuthGateProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGateProvider>{children}</AuthGateProvider>
    </AuthProvider>
  );
}
