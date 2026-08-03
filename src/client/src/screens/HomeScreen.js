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

export default function HomeScreen({ navigation }) {
  const { user, t, c, lang } = useApp();
  const [lastScan, setLastScan] = useState(null);
  const [loading, setLoading] = useState(true);

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
  const { diseaseName, isHealthy } = parseDiseaseLabel(lastScan?.disease);

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <View>
          <Text style={[styles.appName, { color: c.textMuted }]}>
            {t.appName}
          </Text>
          <View style={styles.greetingRow}>
            <Text style={[styles.greeting, { color: c.text }]}>
              {greeting}
              {firstName ? `, ${firstName}` : ""}
            </Text>
            <Ionicons name="happy-outline" size={22} color={c.accent} />
          </View>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            {t.homeSubtitle}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
        {t.lastScan}
      </Text>

      {loading ? (
        <View
          style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
        >
          <Text style={{ color: c.textMuted }}>…</Text>
        </View>
      ) : lastScan ? (
        <TouchableOpacity
          style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={() => navigation.navigate("QuickAction")}
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
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: lastScan.unsupported
                        ? c.warning + "22"
                        : isHealthy
                          ? c.accentSoft
                          : c.danger + "22",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: lastScan.unsupported
                          ? c.warning
                          : isHealthy
                            ? c.accentText
                            : c.danger,
                      },
                    ]}
                  >
                    {lastScan.unsupported ? t.diseaseUnsupported : diseaseName}
                  </Text>
                </View>
                <Text style={[styles.confidence, { color: c.text }]}>
                  {Math.round(lastScan.confidence)}%
                </Text>
              </View>
              <Text style={[styles.date, { color: c.textMuted }]}>
                {formatDate(lastScan.created_at, lang)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Ionicons
            name="clipboard-outline"
            size={32}
            color={c.textFaint}
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyText, { color: c.textMuted }]}>
            {t.lastScanEmpty}
          </Text>
          <TouchableOpacity
            style={[styles.cta, { backgroundColor: c.accent }]}
            onPress={() => navigation.navigate("QuickAction")}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>{t.scanNow}</Text>
          </TouchableOpacity>
        </View>
      )}

      {lastScan && (
        <TouchableOpacity
          style={[styles.secondaryLink, { borderColor: c.border }]}
          onPress={() => navigation.navigate("History")}
          activeOpacity={0.75}
        >
          <Text style={[styles.secondaryLinkText, { color: c.textMuted }]}>
            {t.viewHistory}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 18,
    borderBottomWidth: 1,
  },
  appName: { fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  greeting: { fontSize: 24, fontWeight: "700", letterSpacing: -0.4, marginTop: 4 },
  greetingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  subtitle: { fontSize: 13, marginTop: 6 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardRow: { flexDirection: "row", gap: 14, alignItems: "center" },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: { fontSize: 13, fontWeight: "700" },
  confidence: { fontSize: 15, fontWeight: "700" },
  date: { fontSize: 12, marginTop: 8 },
  emptyIcon: { textAlign: "center", marginBottom: 8 },
  emptyText: { fontSize: 13, textAlign: "center", lineHeight: 19, marginBottom: 16 },
  cta: {
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
  },
  ctaText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  secondaryLink: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 4,
  },
  secondaryLinkText: { fontSize: 13, fontWeight: "600" },
});
