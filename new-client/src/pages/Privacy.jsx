import React from "react";
import { useTranslation } from "@/lib/i18n";
import { Shield } from "lucide-react";

export default function Privacy() {
  const { t, tList } = useTranslation();
  const paragraphs = tList("privacy.paragraphs");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3 py-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto dark:bg-emerald-900/40">
          <Shield className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t("privacy.title")}</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{t("privacy.subtitle")}</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-muted-foreground leading-relaxed">{p}</p>
        ))}
      </section>
    </div>
  );
}