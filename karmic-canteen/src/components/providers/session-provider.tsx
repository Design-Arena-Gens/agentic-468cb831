/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface Props {
  children: React.ReactNode;
  session?: Session | null;
}

export function AuthSessionProvider({ children, session }: Props) {
  return <SessionProvider session={session as any}>{children}</SessionProvider>;
}
