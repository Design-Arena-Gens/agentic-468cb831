"use client";

import { useState, useTransition } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { adminUpdateMenuAction } from "@/lib/actions";
import type { MenuByMeal, MenuItem, MealTime } from "@/lib/storage";

type DraftMenu = Record<MealTime, DraftMenuItem[]>;
interface DraftMenuItem extends MenuItem {
  id: string;
}

const MEAL_LABELS: Record<MealTime, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snacks: "Evening snacks"
};

function createDraft(menu?: MenuByMeal | null): DraftMenu {
  const makeId = () => Math.random().toString(36).slice(2, 9);
  const base: DraftMenu = {
    breakfast: [],
    lunch: [],
    snacks: []
  };
  if (!menu) {
    return base;
  }

  return {
    breakfast: menu.breakfast.map((item) => ({ ...item, id: makeId() })),
    lunch: menu.lunch.map((item) => ({ ...item, id: makeId() })),
    snacks: menu.snacks.map((item) => ({ ...item, id: makeId() }))
  };
}

export default function AdminMenuEditor({
  date,
  menu
}: {
  date: string;
  menu: MenuByMeal | null;
}) {
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<DraftMenu>(createDraft(menu));
  const [saved, setSaved] = useState(false);

  const updateItem = (
    meal: MealTime,
    id: string,
    field: keyof MenuItem,
    value: string
  ) => {
    setDraft((previous) => ({
      ...previous,
      [meal]: previous[meal].map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "calories"
                  ? Number.parseInt(value || "0", 10)
                  : field === "dietaryTags"
                    ? value.split(",").map((tag) => tag.trim()).filter(Boolean)
                    : value
            }
          : item
      )
    }));
  };

  const addItem = (meal: MealTime) => {
    setDraft((previous) => ({
      ...previous,
      [meal]: [
        ...previous[meal],
        {
          id: Math.random().toString(36).slice(2, 9),
          name: "",
          calories: 0,
          dietaryTags: []
        }
      ]
    }));
  };

  const removeItem = (meal: MealTime, id: string) => {
    setDraft((previous) => ({
      ...previous,
      [meal]: previous[meal].filter((item) => item.id !== id)
    }));
  };

  const handleSave = () => {
    const payload: MenuByMeal = {
      breakfast: draft.breakfast.map((item) => ({
        name: item.name,
        calories: item.calories,
        dietaryTags: item.dietaryTags
      })),
      lunch: draft.lunch.map((item) => ({
        name: item.name,
        calories: item.calories,
        dietaryTags: item.dietaryTags
      })),
      snacks: draft.snacks.map((item) => ({
        name: item.name,
        calories: item.calories,
        dietaryTags: item.dietaryTags
      }))
    };

    const formData = new FormData();
    formData.append("date", date);
    formData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      await adminUpdateMenuAction(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Menu builder</h2>
          <p className="text-sm text-slate-500">
            Draft meals, assign dietary tags, and publish in one click.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {pending ? <Save className="size-4 animate-spin" /> : <Save className="size-4" />}
          {pending ? "Saving..." : "Publish menu"}
        </button>
      </div>

      <div className="mt-6 grid gap-6">
        {(Object.keys(draft) as MealTime[]).map((meal) => (
          <div key={meal} className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  {MEAL_LABELS[meal]}
                </h3>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {draft[meal].length} items
                </p>
              </div>
              <button
                type="button"
                onClick={() => addItem(meal)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
              >
                <Plus className="size-4" />
                Add dish
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              {draft[meal].map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="grid gap-4 md:grid-cols-[1.2fr_0.4fr_1fr_auto] md:items-center">
                    <input
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      placeholder="Dish name"
                      value={item.name}
                      onChange={(event) =>
                        updateItem(meal, item.id, "name", event.target.value)
                      }
                    />
                    <input
                      type="number"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      placeholder="Calories"
                      value={item.calories || ""}
                      onChange={(event) =>
                        updateItem(meal, item.id, "calories", event.target.value)
                      }
                    />
                    <input
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      placeholder="Dietary tags (comma separated)"
                      value={item.dietaryTags.join(", ")}
                      onChange={(event) =>
                        updateItem(meal, item.id, "dietaryTags", event.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-2xl border border-transparent bg-white p-3 text-rose-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50"
                      onClick={() => removeItem(meal, item.id)}
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                </div>
              ))}

              {draft[meal].length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  No dishes yet. Click &ldquo;Add dish&rdquo; to start planning.
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {saved ? (
        <p className="mt-4 text-right text-xs font-semibold uppercase tracking-widest text-emerald-600">
          Menu saved successfully
        </p>
      ) : null}
    </section>
  );
}
