export function parseDiseaseLabel(rawLabel) {
  if (!rawLabel) return { crop: "", diseaseName: "Unknown", isHealthy: false };
  const [crop, ...rest] = rawLabel.split("___");
  const diseaseName = rest.length ? rest.join(" ").replace(/_/g, " ") : rawLabel;
  const trimmed = diseaseName.trim();
  return {
    crop,
    diseaseName: trimmed,
    isHealthy: trimmed.toLowerCase() === "healthy",
  };
}
