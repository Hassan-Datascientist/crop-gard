import React from "react";
import { useTranslation } from "@/lib/i18n";
import { Leaf, Sprout, Target } from "lucide-react";

export default function About() {
  const { t } = useTranslation();

  const steps = [t("about.how_1"), t("about.how_2"), t("about.how_3")];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3 py-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <Leaf className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t("about.title")}</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{t("about.subtitle")}</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-semibold text-foreground mb-2">{t("about.what_is")}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{t("about.what_is_desc")}</p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-semibold text-foreground mb-4">{t("about.how_works")}</h3>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center dark:bg-emerald-900/50 dark:text-emerald-300">
                {i + 1}
              </span>
              <p className="text-sm text-muted-foreground pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sprout className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-semibold text-foreground">{t("about.supported_crops")}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t("about.crops_desc")}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {["maize", "potato", "bean"].map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium dark:bg-emerald-900/40 dark:text-emerald-300">
              <Sprout className="h-3.5 w-3.5" />
              {t(`crops.${c}`)}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:bg-emerald-900/20 dark:border-emerald-800">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-semibold text-foreground">{t("about.mission_title")}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{t("about.mission_desc")}</p>
      </section>
    </div>
  );
}