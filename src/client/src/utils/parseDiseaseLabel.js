import { DISEASE_LABEL_NAMES } from "../constants/diseaseData";

const CROP_ALIASES = {
  maize: "corn (maize)",
  corn: "corn (maize)",
  "corn (maize)": "corn (maize)",
  "corn_(maize)": "corn (maize)",
  bean: "bean",
  beans: "bean",
  potato: "potato",
  potatoes: "potato",
};

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(^|[\s/-])([a-z])/g, (m) => m.toUpperCase());
}

export function parseDiseaseLabel(rawLabel, lang = "en") {
  if (!rawLabel) {
    return {
      crop: "",
      diseaseName: "Unknown",
      isHealthy: false,
      friendlyLabel: "Unknown",
      detailKey: "unknown",
    };
  }

  const parts = String(rawLabel).split("___");
  const hasCrop = parts.length > 1;
  const crop = hasCrop ? parts[0] : "";
  const rawDisease = hasCrop ? parts.slice(1).join(" ") : rawLabel;

  const diseaseName = titleCase(rawDisease.replace(/_/g, " ").trim());
  const isHealthy = diseaseName.toLowerCase() === "healthy";

  const names = DISEASE_LABEL_NAMES[lang] || DISEASE_LABEL_NAMES.en;
  const cropKey = normalizeKey(crop);
  const cropLookup = CROP_ALIASES[cropKey] || cropKey;
  const diseaseKey = normalizeKey(rawDisease);

  const cropDict = names[cropLookup];
  const translated = cropDict?.[diseaseKey.replace(/ /g, "_")];

  const displayCrop = hasCrop ? crop.replace(/_/g, " ").trim() : "";
  const displayDisease = translated || diseaseName;

  const friendlyLabel = isHealthy
    ? cropDict?.healthy || displayDisease
    : displayCrop
      ? `${displayCrop} - ${displayDisease}`
      : displayDisease;

  return {
    crop: displayCrop,
    diseaseName: displayDisease,
    isHealthy,
    friendlyLabel,
    detailKey: diseaseKey,
  };
}
