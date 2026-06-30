// src/components/ScanResultCard.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

// Turns "Maize___Northern_Leaf_Blight" into { crop: "Maize", diseaseName: "Northern Leaf Blight" }
function parseDiseaseLabel(rawLabel) {
  if (!rawLabel || rawLabel === "Unknown") {
    return { crop: "", diseaseName: "Unknown", isHealthy: false };
  }
  const [crop, ...rest] = rawLabel.split("___");
  const diseaseName = rest.join(" ").replace(/_/g, " ");
  return {
    crop,
    diseaseName,
    isHealthy: diseaseName.toLowerCase() === "healthy",
  };
}

function getSeverityColor(confidence, isHealthy) {
  if (isHealthy) return COLORS.success ?? "#2E7D32";
  if (confidence >= 0.75) return COLORS.danger ?? "#C62828";
  if (confidence >= 0.5) return COLORS.warning ?? "#F9A825";
  return COLORS.textSecondary ?? "#888";
}

export default function ScanResultCard({ result }) {
  if (!result) return null;

  const { disease, confidence, description, recommendation } = result;
  const { crop, diseaseName, isHealthy } = parseDiseaseLabel(disease);
  const confidencePct = Math.round((confidence ?? 0) * 100);
  const severityColor = getSeverityColor(confidence, isHealthy);
  const isUncertain = disease === "Unknown" || confidence === 0;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        {!!crop && <Text style={styles.cropLabel}>{crop}</Text>}
        <View style={[styles.statusPill, { backgroundColor: severityColor }]}>
          <Text style={styles.statusPillText}>
            {isHealthy
              ? "Healthy"
              : isUncertain
                ? "Inconclusive"
                : "Disease Detected"}
          </Text>
        </View>
      </View>

      <Text style={styles.diseaseName}>{diseaseName}</Text>

      {/* Confidence bar */}
      {!isUncertain && (
        <View style={styles.confidenceSection}>
          <View style={styles.confidenceLabelRow}>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <Text style={[styles.confidenceValue, { color: severityColor }]}>
              {confidencePct}%
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${confidencePct}%`, backgroundColor: severityColor },
              ]}
            />
          </View>
        </View>
      )}

      {/* Description */}
      {!!description && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What we see</Text>
          <Text style={styles.sectionText}>{description}</Text>
        </View>
      )}

      {/* Recommendation */}
      {!!recommendation && !isHealthy && (
        <View style={[styles.section, styles.recommendationBox]}>
          <Text style={styles.sectionLabel}>Recommended action</Text>
          <Text style={styles.sectionText}>{recommendation}</Text>
        </View>
      )}

      {isUncertain && (
        <Text style={styles.uncertainHint}>
          Try retaking the photo in good lighting with the leaf filling the
          frame.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cropLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  diseaseName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary ?? "#1A1A1A",
    marginBottom: 12,
  },
  confidenceSection: { marginBottom: 14 },
  confidenceLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  confidenceLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  confidenceValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border ?? "#E0E0E0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  section: { marginTop: 10 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    color: COLORS.textPrimary ?? "#333",
    lineHeight: 20,
  },
  recommendationBox: {
    backgroundColor: COLORS.background ?? "#F5F5F5",
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  uncertainHint: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
});
