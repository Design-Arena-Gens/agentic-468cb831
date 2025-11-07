import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { addDays, format, isValid, parseISO } from "date-fns";
import { BarChart3, CalendarDays, ChefHat, Target } from "lucide-react";
import clsx from "clsx";
import { authOptions } from "@/lib/auth";
import {
  getDailyConfirmationSummary,
  getDietarySegments,
  getMenuForDate,
  getUpcomingMenus,
  getWasteForecast
} from "@/lib/menu-service";
import AdminMenuEditor from "@/components/admin/admin-menu-editor";
import AdminAttendanceTable from "@/components/admin/admin-attendance-table";

function resolveDate(param?: string | string[] | null) {
  if (!param) {
    return addDays(new Date(), 1);
  }
  const value = Array.isArray(param) ? param[0] : param;
  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return addDays(new Date(), 1);
  }
  return parsed;
}

const targetMeals = {
  breakfast: 60,
  lunch: 80,
  snacks: 50
};

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    redirect("/dashboard");
  }

  const date = resolveDate(searchParams?.date);
  const formattedDate = format(date, "yyyy-MM-dd");

  const [menu, summary, upcoming, waste, segments] = await Promise.all([
    getMenuForDate(formattedDate),
    getDailyConfirmationSummary(formattedDate),
    getUpcomingMenus(5),
    getWasteForecast(formattedDate),
    getDietarySegments(formattedDate)
  ]);

  const friendlyDate = format(date, "EEEE, MMMM do");

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-200">
              <ChefHat className="size-4" />
              Admin console · {friendlyDate}
            </p>
            <h1 className="max-w-2xl text-3xl font-semibold leading-tight md:text-4xl">
              Balance supply and demand with predictive insights and live
              confirmations.
            </h1>
            <p className="max-w-2xl text-slate-300">
              Adjust menus in real-time, encourage opt-ins, and keep food waste
              below the 5% target across the workweek.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-200">
              Capacity plan
            </p>
            <div className="mt-4 space-y-3">
              {waste?.map((row) => (
                <div key={row.slot}>
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-200">
                    <span>{row.slot}</span>
                    <span>{row.confirmed} / {row.capacity}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-white/20">
                    <div
                      className={clsx(
                        "h-2 rounded-full",
                        row.utilization > 85
                          ? "bg-emerald-400"
                          : row.utilization > 60
                            ? "bg-amber-400"
                            : "bg-rose-400"
                      )}
                      style={{ width: `${row.utilization}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    Projected leftovers: {row.expectedWaste} portions
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.8fr_1fr]">
        <AdminMenuEditor date={formattedDate} menu={menu ?? null} />

        <section className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Forecast dashboard
            </h2>
            <p className="text-sm text-slate-500">
              Hit the optimal production band with smart reminders.
            </p>
          </div>
          <div className="space-y-4">
            {Object.entries(summary.total).map(([slot, value]) => {
              const capacity = targetMeals[slot as keyof typeof targetMeals];
              const utilization = Math.min((value / capacity) * 100, 100);
              return (
                <div
                  key={slot}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                    <span className="uppercase tracking-wide">{slot}</span>
                    <span>{value} confirmed</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Capacity: {capacity} · Gap: {Math.max(capacity - value, 0)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-dashed border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Upcoming publishing schedule
            </p>
            <div className="mt-3 space-y-2 text-xs text-slate-500">
              {upcoming.map((item) => (
                <div key={item.date} className="flex items-center justify-between">
                  <span>{format(parseISO(item.date), "EEE, MMM d")}</span>
                  <span
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold uppercase tracking-wide",
                      item.menu ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                    )}
                  >
                    {item.menu ? "Published" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <AdminAttendanceTable employees={summary.employees} date={friendlyDate} />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
            <BarChart3 className="size-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Dietary coverage
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {segments.length > 0
              ? `Covering ${segments.length} dietary categories. Ensure top tags stay balanced.`
              : "Publish a menu to see breakdowns by dietary needs."}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-3xl bg-amber-100 text-amber-600">
            <CalendarDays className="size-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Publish reminders
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Menus auto-lock at 6 PM. Send reminders 2 hours before cut-off for
            maximum participation.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-3xl bg-slate-900 text-white">
            <Target className="size-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Waste threshold
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Keep expected leftovers below 5% ({Math.round(0.05 * targetMeals.lunch)} meals) to hit
            the sustainability promise.
          </p>
        </div>
      </section>
    </div>
  );
}
