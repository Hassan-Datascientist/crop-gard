import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { getLastScan } from "../db/database";
import { parseDiseaseLabel } from "../utils/parseDiseaseLabel";
import { formatDate, getGreetingKey } from "../utils/formatDate";
import Screen from "../components/Screen";
import AppHeader from "../components/AppHeader";
import LanguageSheet from "../components/LanguageSheet";

const STEP_ICONS = ["image", "sparkles", "leaf"];

function statusColor(scan, c) {
  if (scan?.unsupported) return c.warning;
  return scan && !parseDiseaseLabel(scan.disease, "en").isHealthy
    ? c.danger
    : c.accentDeep;
}

export default function HomeScreen({ navigation }) {
  const { user, t, c, lang, isDark, toggleTheme, setLanguage } = useApp();
  const [lastScan, setLastScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [langOpen, setLangOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!user) return;
        const scan = await getLastScan(user.id);
        if (active) {
          setLastScan(scan);
          setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [user]),
  );

  const firstName = user?.first_name || "";
  const greeting = t[getGreetingKey()];
  const { friendlyLabel, isHealthy } = parseDiseaseLabel(lastScan?.disease, lang);
  const steps = [t.step1, t.step2, t.step3];

  return (
    <Screen c={c}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          c={c}
          t={t}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenLanguage={() => setLangOpen(true)}
        />

        <View style={styles.hero}>
          <View style={[styles.badge, { backgroundColor: c.accentSoft }]}>
            <Ionicons name="sparkles" size={13} color={c.accentText} />
            <Text style={[styles.badgeText, { color: c.accentText }]}>
              {t.aiBadge}
            </Text>
          </View>
          <Text style={[styles.greeting, { color: c.text }]}>
            {greeting}
            {firstName ? `, ${firstName}` : ""}
          </Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            {t.homeSubtitle}
          </Text>
        </View>

        <View style={styles.sectionHead}>
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
            {t.lastScan}
          </Text>
          {lastScan && !loading ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("History")}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewAll, { color: c.accentText }]}>
                {t.viewHistory}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {loading ? (
          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={{ color: c.textMuted }}>…</Text>
          </View>
        ) : lastScan ? (
          <TouchableOpacity
            style={[styles.card, styles.lastScanCard, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => navigation.navigate("ScanDetail", { scan: lastScan })}
            activeOpacity={0.8}
          >
            <View style={styles.cardRow}>
              {lastScan.image_url || lastScan.image_uri ? (
                <Image
                  source={{ uri: lastScan.image_url || lastScan.image_uri }}
                  style={[styles.thumb, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[styles.thumb, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
                >
                  <Ionicons name="leaf" size={26} color={c.accent} />
                </View>
              )}

              <View style={styles.cardInfo}>
                <View style={styles.nameRow}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: statusColor(lastScan, c) },
                    ]}
                  />
                  <Text style={[styles.diseaseName, { color: c.text }]} numberOfLines={1}>
                    {lastScan.unsupported ? t.diseaseUnsupported : friendlyLabel}
                  </Text>
                </View>
                <Text style={[styles.meta, { color: c.textMuted }]}>
                  {Math.round(lastScan.confidence)}% · {formatDate(lastScan.created_at, lang)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={c.textFaint} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.card, styles.emptyCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={[styles.emptyIconTile, { backgroundColor: c.accentSoft }]}>
              <Ionicons name="leaf" size={28} color={c.accentText} />
            </View>
            <Text style={[styles.emptyText, { color: c.textMuted }]}>
              {t.lastScanEmpty}
            </Text>
            <TouchableOpacity
              style={[styles.cta, { backgroundColor: c.accent }]}
              onPress={() => navigation.navigate("QuickAction")}
              activeOpacity={0.85}
            >
              <Text style={[styles.ctaText, { color: c.primaryForeground || "#FFFFFF" }]}>
                {t.scanNow}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.steps}>
          {steps.map((step, i) => (
            <View
              key={i}
              style={[styles.stepCard, { backgroundColor: c.surface, borderColor: c.border }]}
            >
              <View style={[styles.stepCircle, { backgroundColor: c.accentSoft }]}>
                <Ionicons name={STEP_ICONS[i]} size={15} color={c.accentText} />
              </View>
              <Text style={[styles.stepText, { color: c.textMuted }]}>{step}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.footer, { color: c.textFaint }]}>{t.footerDisclaimer}</Text>

        <LanguageSheet
          visible={langOpen}
          onClose={() => setLangOpen(false)}
          lang={user?.language_pref || "en"}
          onSelect={setLanguage}
          c={c}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingBottom: 40,
  },
  hero: { alignItems: "flex-start", marginBottom: 24 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    marginBottom: 12,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  greeting: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 33,
  },
  subtitle: { fontSize: 14, marginTop: 6 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  viewAll: { fontSize: 13, fontWeight: "600" },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  lastScanCard: { padding: 12 },
  cardRow: { flexDirection: "row", gap: 14, alignItems: "center" },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1, gap: 6 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  diseaseName: { flex: 1, fontSize: 15, fontWeight: "600" },
  meta: { fontSize: 12 },
  emptyCard: { alignItems: "center", paddingVertical: 28, gap: 14 },
  emptyIconTile: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  cta: {
    paddingHorizontal: 24,
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { fontSize: 14, fontWeight: "600" },
  steps: { flexDirection: "row", gap: 10, marginTop: 8 },
  stepCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 10,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: 11, textAlign: "center", lineHeight: 16 },
  footer: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 24,
  },
});
