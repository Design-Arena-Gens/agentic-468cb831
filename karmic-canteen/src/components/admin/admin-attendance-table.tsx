import { MealOptInState, EmployeePreference, MealTime } from "@/lib/storage";
import { CircleCheck, CircleOff, Mail, MessageCircle } from "lucide-react";
import clsx from "clsx";

interface EmployeeRow {
  userId: string;
  name: string;
  department: string;
  preference?: EmployeePreference;
  meals: MealOptInState;
}

const headers: { key: MealTime; label: string }[] = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "snacks", label: "Snacks" }
];

export default function AdminAttendanceTable({
  employees,
  date
}: {
  employees: EmployeeRow[];
  date: string;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Attendance heatmap
          </h2>
          <p className="text-sm text-slate-500">
            Track confirmations and follow up with colleagues before cut-off.
          </p>
        </div>
        <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 md:flex">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-emerald-600">
            <CircleCheck className="size-4" />
            confirmed
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-rose-600">
            <CircleOff className="size-4" />
            declined
          </span>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-slate-500">
                Employee
              </th>
              <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-slate-500">
                Department
              </th>
              {headers.map((header) => (
                <th
                  key={header.key}
                  className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-slate-500"
                >
                  {header.label}
                </th>
              ))}
              <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-slate-500">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {employees.map((employee) => (
              <tr key={employee.userId} className="text-slate-700">
                <td className="px-4 py-4 font-semibold text-slate-900">
                  {employee.name}
                </td>
                <td className="px-4 py-4 text-slate-500">{employee.department}</td>
                {headers.map((header) => {
                  const data = employee.meals[header.key];
                  const confirmed = data?.optedIn ?? false;
                  return (
                    <td key={header.key} className="px-4 py-4">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                          confirmed
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-rose-100 text-rose-600"
                        )}
                      >
                        {confirmed ? (
                          <CircleCheck className="size-4" />
                        ) : (
                          <CircleOff className="size-4" />
                        )}
                        {confirmed ? "In" : "Out"}
                      </span>
                    </td>
                  );
                })}
                <td className="px-4 py-4 text-sm text-slate-500">
                  {employee.preference?.notes ?? "—"}
                </td>
              </tr>
            ))}
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length + 3}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  No responses yet for {date}. Encourage employees to confirm or
                  enable auto-reminders.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
        >
          <Mail className="size-4" />
          Email reminder
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
        >
          <MessageCircle className="size-4" />
          Slack reminder
        </button>
        <p className="text-xs text-slate-400">
          Reminders are sent only to employees who haven&apos;t responded.
        </p>
      </div>
    </section>
  );
}
