"use client";

import { signOut } from "next-auth/react";

interface Props {
  children: React.ReactNode;
}

export default function SignOutButton({ children }: Props) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
    >
      {children}
    </button>
  );
}
