"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const credentials = [
  {
    label: "Employee",
    email: "alex.chen@karmic.solutions"
  },
  {
    label: "Admin",
    email: "maya.patel@karmic.solutions"
  }
];

export default function LoginPage() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(() =>
    params?.get("error") ? "Invalid credentials. Please try again." : null
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (response?.error) {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
      return;
    }

    window.location.href = "/";
  };

  return (
    <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-white/10 md:grid-cols-[1.15fr_1fr]">
      <section className="flex flex-col justify-between gap-12 bg-gradient-to-br from-emerald-400 via-lime-300 to-sky-400 p-12 text-slate-900">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/25 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-slate-900 shadow">
            <span className="size-2 rounded-full bg-emerald-600" />
            Karmic Canteen
          </div>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Reduce waste, delight employees, and streamline canteen operations.
          </h1>
          <p className="text-lg text-slate-900/80">
            Forecast demand with real-time meal confirmations, personalize menus
            using dietary insights, and send proactive reminders to boost
            participation.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-slate-900/80">
          <p className="font-semibold">Demo accounts</p>
          <div className="grid gap-2">
            {credentials.map((item) => (
              <button
                key={item.email}
                type="button"
                className="flex items-center justify-between rounded-xl bg-white/30 px-4 py-3 text-left transition hover:bg-white/50"
                onClick={() => {
                  setEmail(item.email);
                  setPassword("Passw0rd!");
                }}
              >
                <span>{item.label}</span>
                <code className="rounded bg-white/50 px-2 py-1 text-xs text-slate-900 shadow">
                  {item.email}
                </code>
              </button>
            ))}
          </div>
          <p>
            Shared password for demo:{" "}
            <span className="font-semibold">Passw0rd!</span>
          </p>
        </div>
      </section>

      <section className="relative flex flex-col justify-center gap-10 bg-white p-12">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in with your Karmic Solutions credentials to plan your meals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@karmic.solutions"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              required
              autoComplete="current-password"
            />
          </div>

          {error ? (
            <p className="text-sm font-medium text-rose-600">{error}</p>
          ) : null}

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-5 animate-spin" />
                Signing in
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="space-y-3 text-sm text-slate-400">
          <p className="text-slate-500">
            Need help? Contact{" "}
            <Link href="mailto:canteen-support@karmic.solutions" className="underline-offset-4 hover:underline">
              canteen-support@karmic.solutions
            </Link>
          </p>
          <p>
            All passwords are encrypted and managed in compliance with ISO 27001
            guidelines.
          </p>
        </div>
      </section>
    </div>
  );
}
