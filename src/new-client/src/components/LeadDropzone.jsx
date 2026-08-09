import React, { useRef, useState } from "react";
import { Camera, Leaf, X, Loader2, ImagePlus } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LeafDropzone({ onAnalyze, loading, preview, setPreview }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    onAnalyze(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const onFileChange = (e) => {
    handleFile(e.target.files?.[0]);
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  if (preview) {
    return (
      <div className="relative w-full">
        <div className="relative rounded-2xl overflow-hidden border border-border bg-muted aspect-[4/3]">
          <img src={preview} alt="Leaf preview" className="w-full h-full object-cover" />
          {loading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 text-white">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="text-sm font-medium">{t("dropzone.analyzing")}</p>
            </div>
          )}
        </div>
        {!loading && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 rounded-full h-9 w-9 shadow-md"
            onClick={clearPreview}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={cn(
        "relative rounded-2xl border-2 border-dashed transition-all duration-300 aspect-[4/3] flex flex-col items-center justify-center gap-5 p-8 text-center",
        isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-muted/30 hover:bg-muted/60"
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Leaf className="h-8 w-8 text-primary" />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">{t("dropzone.title")}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{t("dropzone.subtitle")}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Button
          variant="default"
          className="flex-1 gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          {t("dropzone.upload")}
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera className="h-4 w-4" />
          {t("dropzone.camera")}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}