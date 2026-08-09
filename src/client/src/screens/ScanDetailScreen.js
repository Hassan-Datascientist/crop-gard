import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { parseDiseaseLabel } from "../utils/parseDiseaseLabel";
import { formatDate } from "../utils/formatDate";
import { DISEASE_DETAILS } from "../constants/diseaseData";
import Screen from "../components/Screen";
import SubHeader from "../components/SubHeader";

export default function ScanDetailScreen({ navigation, route }) {
  const { t, c, lang, removeScan } = useApp();
  const { scan } = route.params;

  const { friendlyLabel, isHealthy } = parseDiseaseLabel(scan.disease, lang);
  const detailKey = parseDiseaseLabel(scan.disease, lang).detailKey;
  const remedy = scan.unsupported
    ? DISEASE_DETAILS[lang]?.unknown || DISEASE_DETAILS.en.unknown
    : DISEASE_DETAILS[lang]?.[detailKey] ||
      DISEASE_DETAILS.en[detailKey] ||
      DISEASE_DETAILS.en.unknown;

  const confidenceNum = parseFloat(String(scan.confidence ?? 0));
  const confidenceColor =
    confidenceNum >= 80 ? c.accent : confidenceNum >= 55 ? c.warning : c.danger;

  const statusColor = scan.unsupported ? c.warning : isHealthy ? c.accentDeep : c.danger;
  const statusBg = scan.unsupported ? c.warningSoft : isHealthy ? c.accentSoft : c.dangerSoft;
  const statusText = scan.unsupported ? c.warning : isHealthy ? c.accentText : c.danger;

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
    <Screen c={c}>
      <View style={styles.flex}>
        <View style={styles.headerWrap}>
          <SubHeader
            title={t.scanDetails}
            c={c}
            onBack={() => navigation.goBack()}
            onRight={confirmDelete}
            rightIcon="trash-outline"
          />
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

          <View style={[styles.badge, { backgroundColor: statusBg }]}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.badgeText, { color: statusText }]}>
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
              <View style={[styles.sectionIcon, { backgroundColor: c.accentSoft }]}>
                <Ionicons name="flask" size={14} color={c.accentText} />
              </View>
              <Text style={[styles.sectionLabel, { color: c.textMuted }]}>{t.cause}</Text>
            </View>
            <Text style={[styles.sectionText, { color: c.text }]}>{remedy.cause || "-"}</Text>
          </View>

          {!isHealthy && !scan.unsupported && (
            <View style={[styles.section, styles.treatmentBox, { backgroundColor: c.accentSoft, borderColor: c.accent }]}>
              <View style={styles.sectionLabelRow}>
                <View style={[styles.sectionIcon, { backgroundColor: c.accentDeep }]}>
                  <Ionicons name="leaf" size={14} color="#FFFFFF" />
                </View>
                <Text style={[styles.sectionLabel, { color: c.accentText }]}>{t.treatment}</Text>
              </View>
              <Text style={[styles.sectionText, { color: c.text }]}>{remedy.treatment || "-"}</Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerWrap: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingBottom: 12,
  },
  scroll: { padding: 20, gap: 16 },
  image: {
    width: "100%",
    aspectRatio: 4 / 3,
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
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 99,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 15, fontWeight: "600", letterSpacing: 0.1 },
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
    gap: 8,
  },
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
  bottomSpacer: { height: 20 },
});
