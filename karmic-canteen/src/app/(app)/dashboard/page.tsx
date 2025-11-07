import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  CircleCheck,
  Flame,
  Leaf,
  Salad,
  UtensilsCrossed
} from "lucide-react";
import { format, addDays, isValid, parseISO } from "date-fns";
import clsx from "clsx";
import { authOptions } from "@/lib/auth";
import {
  getDailyConfirmationSummary,
  getDietarySegments,
  getMenuForDate,
  getPreferences,
  getUpcomingMenus,
  getUserConfirmations,
  getWasteForecast,
  MEAL_TIMES
} from "@/lib/menu-service";
import type { MenuByMeal } from "@/lib/storage";
import MealToggle from "@/components/meals/meal-toggle";
import PreferenceForm from "@/components/preferences/preference-form";
import UpcomingMenuStrip from "@/components/meals/upcoming-menu-strip";

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

function MealSection({
  label,
  menu,
  date,
  userId,
  optInStatus
}: {
  label: string;
  menu: MenuByMeal["breakfast"];
  date: string;
  userId: string;
  optInStatus: boolean;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <UtensilsCrossed className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{label}</h2>
            <p className="text-sm text-slate-500">
              Select if you’ll enjoy this meal tomorrow.
            </p>
          </div>
        </div>
        <MealToggle
          date={date}
          userId={userId}
          meal={label.toLowerCase() as "breakfast" | "lunch" | "snacks"}
          optedIn={optInStatus}
        />
      </div>

      <div className="grid gap-4 px-6 py-6">
        {menu.map((item) => (
          <div
            key={item.name}
            className="flex items-start gap-4 rounded-2xl bg-slate-50/80 p-4"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white shadow">
              <Salad className="size-6 text-emerald-500" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <p className="text-base font-semibold text-slate-900">
                  {item.name}
                </p>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <Flame className="size-4 text-rose-500" />
                  {item.calories} kcal
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {item.dietaryTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700"
                  >
                    <Leaf className="size-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id as string;

  const selectedDate = resolveDate(searchParams?.date);
  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  const [menu, confirmationState, preference, upcoming, summary, segments, waste] =
    await Promise.all([
      getMenuForDate(formattedDate),
      getUserConfirmations(formattedDate, session.user.id),
      getPreferences(session.user.id),
      getUpcomingMenus(5),
      getDailyConfirmationSummary(formattedDate),
      getDietarySegments(formattedDate),
      getWasteForecast(formattedDate)
    ]);

  const friendlyDate = format(selectedDate, "EEEE, MMMM do");

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-200">
              <CalendarDays className="size-4" />
              Meal plan for {friendlyDate}
            </p>
            <h1 className="max-w-xl text-3xl font-semibold leading-snug md:text-4xl">
              Good choices today impact tomorrow’s sustainability footprint.
            </h1>
            <p className="max-w-2xl text-slate-300">
              Confirm your meals so our chefs prepare the right portions,
              minimize leftovers, and tailor menus to your preferences.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-5 text-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-200">
              Your week at a glance
            </p>
            <div className="mt-4 space-y-4">
              {waste?.map((slot) => (
                <div key={slot.slot} className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-200">
                    <p>{slot.slot}</p>
                    <p>{slot.utilization}% utilized</p>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
                    <div
                      className={clsx(
                        "h-full rounded-full",
                        slot.utilization > 80
                          ? "bg-emerald-400"
                          : slot.utilization > 50
                            ? "bg-amber-400"
                            : "bg-rose-400"
                      )}
                      style={{ width: `${slot.utilization}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-300">
                    Expected leftovers: {slot.expectedWaste} portions
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <UpcomingMenuStrip dates={upcoming} activeDate={formattedDate} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-6">
          {menu ? (
            MEAL_TIMES.map((slot) => (
              <MealSection
                key={slot}
                label={slot.charAt(0).toUpperCase() + slot.slice(1)}
                menu={menu[slot]}
                date={formattedDate}
                userId={userId}
                optInStatus={confirmationState[slot]?.optedIn ?? false}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <UtensilsCrossed className="size-10 text-slate-300" />
              <h2 className="mt-4 text-xl font-semibold text-slate-700">
                Menu not published yet
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                The canteen team is finalizing tomorrow’s options. Check back in
                a little while or enable notifications to get an alert.
              </p>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Team insights
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Live confirmation stats help chefs plan smart portions.
            </p>

            <div className="mt-6 space-y-4">
              {MEAL_TIMES.map((slot) => (
                <div key={slot}>
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                    <span className="uppercase tracking-wide">{slot}</span>
                    <span>{summary.total[slot]} confirmed</span>
                  </div>
                  <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${Math.min((summary.total[slot] / 80) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Dietary focus
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              We optimize menus to serve diverse dietary needs equitably.
            </p>
            <div className="mt-6 grid gap-3">
              {segments.map((segment) => (
                <div
                  key={segment.tag}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600"
                >
                  <span className="capitalize">{segment.tag}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <CircleCheck className="size-4" />
                    {segment.count} dishes
                  </span>
                </div>
              ))}
              {segments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Publish a menu to reveal dietary coverage metrics.
                </p>
              ) : null}
            </div>
          </section>

          <PreferenceForm preference={preference} />
        </aside>
      </div>
    </div>
  );
}
