export function formatDate(iso, lang = "en") {
  if (!iso) return "";
  try {
    const d = new Date(String(iso).replace(" ", "T") + "Z");
    return d.toLocaleDateString(lang === "ar" ? "ar-EG" : lang, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso);
  }
}

export function getGreetingKey(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "goodMorning";
  if (h < 17) return "goodAfternoon";
  return "goodEvening";
}
