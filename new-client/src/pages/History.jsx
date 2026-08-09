import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { History as HistoryIcon, Trash2, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import PullToRefresh from "@/components/PullToRefresh";

const severityDot = {
  none: "bg-emerald-500",
  low: "bg-lime-500",
  moderate: "bg-amber-500",
  high: "bg-orange-500",
  severe: "bg-red-500",
};

export default function History() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [items, setItems] = useState(null);

  const load = async () => {
    try {
      const data = await base44.entities.Prediction.list("-created_date", 100);
      setItems(data);
    } catch (e) {
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t("history.confirm_delete"))) return;
    const snapshot = items || [];
    // Optimistic: remove immediately for a snappy, native-like feel
    setItems(snapshot.filter((p) => p.id !== id));
    try {
      await base44.entities.Prediction.delete(id);
      toast({ title: t("toast.deleted_title") });
    } catch (e) {
      // Restore the item if the server call fails
      setItems(snapshot);
      toast({ variant: "destructive", title: t("toast.failed_title"), description: e.message });
    }
  };

  const fmtDate = (d) => new Date(d).toLocaleString();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">{t("history.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("history.subtitle")}</p>
      </div>

      {items === null ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <PullToRefresh onRefresh={load}>
          {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4 dark:bg-emerald-900/40">
            <HistoryIcon className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-base font-semibold text-foreground">{t("history.empty_title")}</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">{t("history.empty_desc")}</p>
          <Button asChild className="gap-2">
            <Link to="/">{t("history.scan_now")}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => {
            const sevDot = severityDot[p.severity] || "bg-amber-500";
            const conf = Math.round((p.confidence || 0) * 100);
            return (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-3 shadow-sm flex gap-3">
                <Link to={`/result/${p.id}`} className="shrink-0">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted border border-border">
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </Link>

                <Link to={`/result/${p.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full shrink-0", sevDot)} />
                    <p className="text-sm font-semibold text-foreground truncate">{p.disease_name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {p.crop_type && p.crop_type !== "other" ? t(`crops.${p.crop_type}`) + " · " : ""}
                    {conf}% · {fmtDate(p.created_date)}
                  </p>
                </Link>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="shrink-0 self-center w-11 h-11 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label={t("history.delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
        )}
        </PullToRefresh>
      )}
    </div>
  );
}