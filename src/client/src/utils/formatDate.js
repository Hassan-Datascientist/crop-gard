export function formatDate(iso, lang = "en") {
  if (!iso) return "";
  const raw = String(iso).replace(" ", "T");
  const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(raw);
  const d = new Date(hasTz ? raw : raw + "Z");
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(lang === "ar" ? "ar-EG" : lang, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getGreetingKey(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "goodMorning";
  if (h < 17) return "goodAfternoon";
  return "goodEvening";
}
