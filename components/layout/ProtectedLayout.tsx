"use client";

import PasswordProtection from "@/components/auth/PasswordProtection";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PasswordProtection>
      {children}
    </PasswordProtection>
  );
}
