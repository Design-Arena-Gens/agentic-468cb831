"use client";

import { useTransition } from "react";
import { toggleMealForUser } from "@/lib/actions";
import { CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";

interface MealToggleProps {
  date: string;
  userId: string;
  meal: "breakfast" | "lunch" | "snacks";
  optedIn: boolean;
}

export default function MealToggle({
  date,
  userId,
  meal,
  optedIn
}: MealToggleProps) {
  const [pending, startTransition] = useTransition();

  const handleToggle = (value: boolean) => {
    startTransition(async () => {
      await toggleMealForUser({
        date,
        meal,
        userId,
        optedIn: value
      });
    });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={pending || optedIn}
        onClick={() => handleToggle(true)}
        className={clsx(
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2",
          optedIn
            ? "bg-emerald-100 text-emerald-600 ring-emerald-200"
            : "bg-slate-100 text-slate-700 hover:bg-emerald-500/10 hover:text-emerald-600 focus:ring-emerald-400"
        )}
      >
        <CheckCircle2 className="size-4" />
        I&apos;m in
      </button>
      <button
        type="button"
        disabled={pending || !optedIn}
        onClick={() => handleToggle(false)}
        className={clsx(
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2",
          !optedIn
            ? "bg-rose-100 text-rose-600 ring-rose-200"
            : "bg-slate-100 text-slate-700 hover:bg-rose-500/10 hover:text-rose-600 focus:ring-rose-400"
        )}
      >
        <XCircle className="size-4" />
        Skip
      </button>
    </div>
  );
}
