import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { parseDiseaseLabel } from "../utils/parseDiseaseLabel";

export default function ResultCard({ result, t, c, lang = "en" }) {
  if (!result) return null;

  const { disease, confidence, unsupported } = result;
  const { friendlyLabel, isHealthy } = parseDiseaseLabel(disease, lang);
  const confidenceNum = parseFloat(String(confidence ?? 0));
  const confidenceColor = confidenceNum >= 80 ? c.accent : confidenceNum >= 55 ? c.warning : c.danger;

  const statusColor = unsupported ? c.warning : isHealthy ? c.accentDeep : c.danger;
  const statusBg = unsupported ? c.warningSoft : isHealthy ? c.accentSoft : c.dangerSoft;
  const statusText = unsupported ? c.warning : isHealthy ? c.accentText : c.danger;
  const statusIcon = unsupported ? "help-circle" : isHealthy ? "checkmark-circle" : "warning";

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.statusRow}>
        <View style={[styles.badge, { backgroundColor: statusBg }]}>
          <Ionicons name={statusIcon} size={16} color={statusText} />
          <Text style={[styles.badgeText, { color: statusText }]}>
            {unsupported ? t.unsupported : friendlyLabel}
          </Text>
        </View>
      </View>

      <View style={[styles.confidenceSection, { borderTopColor: c.border }]}>
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

      <View style={[styles.section, { borderTopColor: c.border }]}>
        <View style={styles.sectionLabelRow}>
          <View style={[styles.sectionIcon, { backgroundColor: c.accentSoft }]}>
            <Ionicons name="flask" size={14} color={c.accentText} />
          </View>
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>{t.cause}</Text>
        </View>
        <Text style={[styles.sectionText, { color: c.text }]}>{result.description || "-"}</Text>
      </View>

      {!isHealthy && !unsupported && (
        <View style={[styles.section, styles.treatmentBox, { backgroundColor: c.accentSoft, borderTopColor: c.border }]}>
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionIcon, { backgroundColor: c.accentDeep }]}>
              <Ionicons name="leaf" size={14} color="#FFFFFF" />
            </View>
            <Text style={[styles.sectionLabel, { color: c.accentText }]}>{t.treatment}</Text>
          </View>
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
  statusRow: { padding: 16, paddingBottom: 10 },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
  },
  badgeText: { fontSize: 14, fontWeight: "600", letterSpacing: 0.1 },
  confidenceSection: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, gap: 8 },
  confidenceLabel: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 13, fontWeight: "500" },
  confidenceValue: { fontSize: 14, fontWeight: "700" },
  barBg: { height: 6, borderRadius: 99, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 99 },
  section: { padding: 16, borderTopWidth: 1, gap: 8 },
  treatmentBox: {
    borderLeftWidth: 3,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionText: { fontSize: 14, lineHeight: 21 },
});
