import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useTranslation } from "@/lib/i18n";
import LeafDropzone from "@/components/LeafDropzone";
import AnalysisResults from "@/components/AnalysisResults";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { t } = useTranslation();
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async (file) => {
    if (!file) return;
    if (!navigator.onLine) {
      toast({ variant: "destructive", title: t("toast.failed_title"), description: t("errors.no_internet") });
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const response = await base44.functions.invoke("analyzeLeaf", { file_url });
      const data = response.data?.result || response.data;
      if (!data) throw new Error("empty");

      if (!data.is_plant_leaf) {
        toast({ variant: "destructive", title: t("toast.no_leaf_title"), description: t("toast.no_leaf_desc") });
        return;
      }
      if (!data.is_supported_crop) {
        toast({ variant: "destructive", title: t("toast.unsupported_crop_title"), description: t("toast.unsupported_crop_desc") });
        return;
      }

      // Save prediction to history
      const created = await base44.entities.Prediction.create({
        disease_name: data.disease_name,
        crop_type: data.crop_type,
        confidence: data.confidence,
        severity: data.severity,
        description: data.description || "",
        image_url: file_url,
        symptoms: data.symptoms || [],
        treatment: data.treatment || [],
        prevention: data.prevention || [],
      });

      setResults({ ...data, id: created.id, image_url: file_url });
    } catch (error) {
      const msg =
        error?.status >= 500 ? t("errors.server_error")
        : /network|fetch|failed to fetch/i.test(error?.message || "") ? t("errors.no_internet")
        : t("errors.prediction_failed");
      toast({ variant: "destructive", title: t("toast.failed_title"), description: msg });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: t("steps.upload.title"), desc: t("steps.upload.desc") },
    { title: t("steps.analyze.title"), desc: t("steps.analyze.desc") },
    { title: t("steps.treat.title"), desc: t("steps.treat.desc") },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium dark:bg-emerald-900/40 dark:text-emerald-300">
          <Sparkles className="h-3 w-3" />
          {t("home.badge")}
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{t("home.title")}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">{t("home.subtitle")}</p>
      </section>

      {/* Upload */}
      <LeafDropzone onAnalyze={handleAnalyze} loading={loading} preview={preview} setPreview={setPreview} />

      {/* Results */}
      {results && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AnalysisResults data={results} />
          <div className="mt-5 flex justify-center">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/history">
                <HistoryIcon className="h-4 w-4" />
                {t("nav.history")}
              </Link>
            </Button>
          </div>
        </section>
      )}

      {!results && !loading && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {steps.map((step, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mx-auto mb-2 dark:bg-emerald-900/50 dark:text-emerald-300">
                {i + 1}
              </div>
              <p className="text-sm font-semibold text-foreground">{step.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
            </div>
          ))}
        </section>
      )}

      <footer className="text-center pb-2">
        <p className="text-xs text-muted-foreground">{t("footer.disclaimer")}</p>
      </footer>
    </div>
  );
}