import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useTranslation } from "@/lib/i18n";
import AnalysisResults from "@/components/AnalysisResults";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, FileX2 } from "lucide-react";

export default function PredictionResult() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await base44.entities.Prediction.get(id);
        if (active) setRecord(data);
      } catch (e) {
        if (active) setRecord(false);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const fmtDate = (d) => new Date(d).toLocaleString();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FileX2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-base font-semibold text-foreground">{t("result.not_found")}</p>
        <p className="text-sm text-muted-foreground mt-1 mb-5">{t("result.not_found_desc")}</p>
        <Button asChild className="gap-2">
          <Link to="/history">{t("result.go_history")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
          <Link to="/history">
            <ArrowLeft className="h-4 w-4" />
            {t("result.back")}
          </Link>
        </Button>
        <span className="text-xs text-muted-foreground">{t("result.scan_date", { date: fmtDate(record.created_date) })}</span>
      </div>

      <AnalysisResults data={record} />
    </div>
  );
}