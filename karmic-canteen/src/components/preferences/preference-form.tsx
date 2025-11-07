"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Loader2, ShieldHalf } from "lucide-react";
import clsx from "clsx";
import { updateUserPreferencesAction } from "@/lib/actions";

interface Preference {
  dietaryTags: string[];
  autoSubscribe: string[];
  notes?: string;
}

const dietaryOptions = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "high-protein",
  "low-carb",
  "spicy",
  "low-sugar"
];

const mealOptions = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "snacks", label: "Evening snacks" }
];

export default function PreferenceForm({ preference }: { preference: Preference }) {
  const [pending, startTransition] = useTransition();
  const [selectedTags, setSelectedTags] = useState<string[]>(
    preference.dietaryTags ?? []
  );
  const [autoSubscribe, setAutoSubscribe] = useState<string[]>(
    preference.autoSubscribe ?? []
  );
  const [notes, setNotes] = useState(preference.notes ?? "");
  const [saved, setSaved] = useState(false);

  const isSelected = (value: string, list: string[]) => list.includes(value);

  const handleSubmit = () => {
    const formData = new FormData();
    selectedTags.forEach((tag) => formData.append("dietaryTags", tag));
    autoSubscribe.forEach((slot) => formData.append("autoSubscribe", slot));
    formData.append("notes", notes);

    startTransition(async () => {
      await updateUserPreferencesAction(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const selectedSummary = useMemo(() => {
    if (selectedTags.length === 0) {
      return "No dietary tags selected.";
    }
    return selectedTags.map((tag) => tag.replace("-", " ")).join(", ");
  }, [selectedTags]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <ShieldHalf className="size-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Dietary preferences
          </h3>
          <p className="text-sm text-slate-500">
            Fine-tune your experience and auto-confirm selected meals.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Dietary tags
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {dietaryOptions.map((option) => {
              const active = isSelected(option, selectedTags);
              return (
                <button
                  key={option}
                  type="button"
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition",
                    active
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-600"
                  )}
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(option)
                        ? prev.filter((item) => item !== option)
                        : [...prev, option]
                    )
                  }
                >
                  {active ? <Check className="size-4" /> : null}
                  {option.replace("-", " ")}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">{selectedSummary}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Auto confirm meals
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {mealOptions.map((meal) => {
              const active = isSelected(meal.value, autoSubscribe);
              return (
                <button
                  key={meal.value}
                  type="button"
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-900/40 hover:text-slate-900"
                  )}
                  onClick={() =>
                    setAutoSubscribe((prev) =>
                      prev.includes(meal.value)
                        ? prev.filter((item) => item !== meal.value)
                        : [...prev, meal.value]
                    )
                  }
                >
                  {active ? <Check className="size-4" /> : null}
                  {meal.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            We’ll automatically mark you “in” for these meals. You can always
            change selections before 6 PM.
          </p>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Additional notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            placeholder="Remind the chef about portion size, spice tolerance, etc."
          />
        </div>
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={handleSubmit}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? "Saving preferences" : "Save preferences"}
      </button>

      {saved ? (
        <p className="mt-3 text-center text-xs font-semibold uppercase tracking-wide text-emerald-600">
          Preferences updated
        </p>
      ) : null}
    </section>
  );
}
