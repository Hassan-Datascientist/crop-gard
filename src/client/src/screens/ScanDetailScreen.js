import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { parseDiseaseLabel } from "../utils/parseDiseaseLabel";
import { formatDate } from "../utils/formatDate";
import { DISEASE_DETAILS } from "../constants/diseaseData";

export default function ScanDetailScreen({ navigation, route }) {
  const { t, c, lang, removeScan } = useApp();
  const { scan } = route.params;

  const { friendlyLabel, isHealthy, detailKey } = parseDiseaseLabel(
    scan.disease,
    lang,
  );
  const remedy = scan.unsupported
    ? DISEASE_DETAILS[lang]?.unknown || DISEASE_DETAILS.en.unknown
    : DISEASE_DETAILS[lang]?.[detailKey] ||
      DISEASE_DETAILS.en[detailKey] ||
      DISEASE_DETAILS.en.unknown;

  const confidenceNum = parseFloat(String(scan.confidence ?? 0));
  const confidenceColor =
    confidenceNum >= 80 ? c.accent : confidenceNum >= 55 ? c.warning : c.danger;

  const imageUri = scan.image_url || scan.image_uri;

  const confirmDelete = () => {
    Alert.alert(t.deleteScan, t.deleteScanConfirm, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.deleteScan,
        style: "destructive",
        onPress: async () => {
          await removeScan(scan.uuid);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.back, { color: c.textMuted }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: c.text }]}>{t.scanDetails}</Text>
        <TouchableOpacity onPress={confirmDelete} activeOpacity={0.6} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="trash-outline" size={20} color={c.textFaint} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[styles.image, styles.imageFallback, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
          >
            <Ionicons name="leaf" size={48} color={c.accent} />
          </View>
        )}

        <View
          style={[
            styles.badge,
            {
              backgroundColor: scan.unsupported
                ? c.warning + "22"
                : isHealthy
                  ? c.accentSoft
                  : c.danger + "22",
            },
          ]}
        >
          <Ionicons
            name={scan.unsupported ? "help-circle" : isHealthy ? "checkmark-circle" : "warning"}
            size={18}
            color={scan.unsupported ? c.warning : isHealthy ? c.accentText : c.danger}
          />
          <Text
            style={[
              styles.badgeText,
              { color: scan.unsupported ? c.warning : isHealthy ? c.accentText : c.danger },
            ]}
          >
            {scan.unsupported ? t.unsupported : friendlyLabel}
          </Text>
        </View>

        <View style={[styles.confidenceSection, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.confidenceLabel}>
            <Text style={[styles.label, { color: c.textMuted }]}>{t.confidence}</Text>
            <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
              {Math.round(confidenceNum)}%
            </Text>
          </View>
          <View style={[styles.barBg, { backgroundColor: c.surfaceAlt }]}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.min(confidenceNum, 100)}%`, backgroundColor: confidenceColor },
              ]}
            />
          </View>
          <Text style={[styles.date, { color: c.textMuted }]}>
            {t.scannedOn} {formatDate(scan.created_at, lang)}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.sectionLabelRow}>
            <Ionicons name="flask-outline" size={13} color={c.textMuted} />
            <Text style={[styles.sectionLabel, { color: c.textMuted }]}>{t.cause}</Text>
          </View>
          <Text style={[styles.sectionText, { color: c.text }]}>{remedy.cause || "-"}</Text>
        </View>

        {!isHealthy && !scan.unsupported && (
          <View style={[styles.section, styles.treatmentBox, { backgroundColor: c.accentSoft, borderColor: c.accent }]}>
            <View style={styles.sectionLabelRow}>
              <Ionicons name="leaf" size={13} color={c.accent} />
              <Text style={[styles.sectionLabel, { color: c.accent }]}>{t.treatment}</Text>
            </View>
            <Text style={[styles.sectionText, { color: c.text }]}>{remedy.treatment || "-"}</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  back: { fontSize: 34, lineHeight: 34, fontWeight: "600" },
  pageTitle: { fontSize: 18, fontWeight: "700" },
  scroll: { padding: 20, gap: 16 },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    borderWidth: 1,
  },
  imageFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  badgeText: { fontSize: 15, fontWeight: "700", letterSpacing: 0.1 },
  confidenceSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  confidenceLabel: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 13, fontWeight: "500" },
  confidenceValue: { fontSize: 16, fontWeight: "700" },
  barBg: { height: 8, borderRadius: 99, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 99 },
  date: { fontSize: 12 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  treatmentBox: {
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderTopWidth: 1,
    borderBottomWidth: 0,
  },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionText: { fontSize: 14, lineHeight: 21 },
  bottomSpacer: { height: 20 },
});
