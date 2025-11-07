import Link from "next/link";
import { format, parseISO } from "date-fns";
import clsx from "clsx";
import { Calendar, ChefHat, Clock } from "lucide-react";
import type { MenuByMeal } from "@/lib/storage";

interface DayInfo {
  date: string;
  menu: MenuByMeal | null;
}

export default function UpcomingMenuStrip({
  dates,
  activeDate
}: {
  dates: DayInfo[];
  activeDate: string;
}) {
  return (
    <div className="mt-10 flex flex-wrap items-stretch gap-4">
      {dates.map((item) => {
        const parsed = parseISO(item.date);
        const label = format(parsed, "EEE");
        const day = format(parsed, "d");
        const hasMenu = Boolean(item.menu);
        const isActive = item.date === activeDate;

        return (
          <Link
            href={`/dashboard?date=${item.date}`}
            key={item.date}
            className={clsx(
              "group flex min-w-[180px] flex-1 flex-col rounded-2xl border border-white/15 px-5 py-4 text-left text-sm transition hover:border-white/50 hover:bg-white/10",
              isActive ? "bg-white/15" : "bg-white/5"
            )}
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-200">
              <span className="inline-flex items-center gap-2">
                <Calendar className="size-4" />
                {label}
              </span>
              <span>{day}</span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-white">
              <div>
                <p className="text-lg font-semibold">
                  {hasMenu ? "Menu live" : "Pending"}
                </p>
                <p className="text-xs text-slate-200">
                  {hasMenu ? "Confirm by 6 PM today" : "Chef team drafting menu"}
                </p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                {hasMenu ? <ChefHat className="size-5" /> : <Clock className="size-5" />}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
