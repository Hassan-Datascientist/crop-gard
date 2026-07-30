import React from "react";
import { View, Text, StyleSheet } from "react-native";

function parseDiseaseLabel(rawLabel) {
  if (!rawLabel) return { crop: "", diseaseName: "Unknown", isHealthy: false };
  const [crop, ...rest] = rawLabel.split("___");
  const diseaseName = rest.length ? rest.join(" ").replace(/_/g, " ") : rawLabel;
  const trimmed = diseaseName.trim();
  return { crop, diseaseName: trimmed, isHealthy: trimmed.toLowerCase() === "healthy" };
}

export default function ResultCard({ result, t, c }) {
  if (!result) return null;

  const { disease, confidence, unsupported } = result;
  const { diseaseName, isHealthy } = parseDiseaseLabel(disease);
  const confidenceNum = parseFloat(String(confidence ?? 0));
  const confidenceColor = confidenceNum >= 80 ? c.accent : confidenceNum >= 55 ? c.warning : c.danger;

  if (unsupported) {
    return (
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.warning }]}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <Text style={[styles.headerText, { color: c.textMuted }]}>📊 {t.report}</Text>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.badge, { backgroundColor: c.warning + "22" }]}>
            <Text style={[styles.badgeText, { color: c.warning }]}>
              ❓ {t.unsupported}
            </Text>
          </View>
        </View>

        <View style={styles.confidenceSection}>
          <View style={styles.confidenceLabel}>
            <Text style={[styles.label, { color: c.textMuted }]}>{t.confidence}</Text>
            <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
              {Math.round(confidenceNum)}%
            </Text>
          </View>
          <View style={[styles.barBg, { backgroundColor: c.surfaceAlt }]}>
            <View style={[styles.barFill, { width: `${Math.min(confidenceNum, 100)}%`, backgroundColor: confidenceColor }]} />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: c.border }]} />

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>🔬 {t.cause}</Text>
          <Text style={[styles.sectionText, { color: c.text }]}>{result.description || "-"}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <Text style={[styles.headerText, { color: c.textMuted }]}>📊 {t.report}</Text>
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.badge, { backgroundColor: isHealthy ? c.accentSoft : (c.danger + "22") }]}>
          <Text style={[styles.badgeText, { color: isHealthy ? c.accentText : c.danger }]}>
            {isHealthy ? "✅" : "⚠️"} {diseaseName}
          </Text>
        </View>
      </View>

      <View style={styles.confidenceSection}>
        <View style={styles.confidenceLabel}>
          <Text style={[styles.label, { color: c.textMuted }]}>{t.confidence}</Text>
          <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
            {Math.round(confidenceNum)}%
          </Text>
        </View>
        <View style={[styles.barBg, { backgroundColor: c.surfaceAlt }]}>
          <View style={[styles.barFill, { width: `${Math.min(confidenceNum, 100)}%`, backgroundColor: confidenceColor }]} />
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: c.border }]} />

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: c.textMuted }]}>🔬 {t.cause}</Text>
        <Text style={[styles.sectionText, { color: c.text }]}>{result.description || "-"}</Text>
      </View>

      {!isHealthy && (
        <View style={[styles.section, styles.treatmentBox, { backgroundColor: c.accentSoft, borderColor: c.accent }]}>
          <Text style={[styles.sectionLabel, { color: c.accent }]}>🌿 {t.treatment}</Text>
          <Text style={[styles.sectionText, { color: c.text }]}>{result.recommendation || "-"}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 20,
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  headerText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  statusRow: { padding: 16, paddingBottom: 8 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  badgeText: { fontSize: 15, fontWeight: "700", letterSpacing: 0.1 },
  confidenceSection: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  confidenceLabel: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 13, fontWeight: "500" },
  confidenceValue: { fontSize: 14, fontWeight: "700" },
  barBg: { height: 6, borderRadius: 99, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 99 },
  divider: { height: 1, width: "100%" },
  section: { padding: 16, gap: 6 },
  treatmentBox: {
    borderTopWidth: 1,
    borderLeftWidth: 3,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderRadius: 0,
    margin: 0,
  },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  sectionText: { fontSize: 14, lineHeight: 21 },
});
