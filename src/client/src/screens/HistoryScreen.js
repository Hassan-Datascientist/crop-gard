import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { History, Leaf, Trash2 } from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { getScans } from "../db/database";
import { parseDiseaseLabel } from "../utils/parseDiseaseLabel";
import { formatDate } from "../utils/formatDate";
import Screen from "../components/Screen";

function statusColor(scan, c) {
  if (scan?.unsupported) return c.warning;
  return scan && !parseDiseaseLabel(scan.disease, "en").isHealthy
    ? c.danger
    : c.accentDeep;
}

export default function HistoryScreen({ navigation }) {
  const { user, t, c, lang, removeScan } = useApp();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!user) return;
        const rows = await getScans(user.id);
        if (active) {
          setScans(rows);
          setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [user]),
  );

  const confirmDelete = (item) => {
    Alert.alert(t.deleteScan, t.deleteScanConfirm, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.deleteScan,
        style: "destructive",
        onPress: () => {
          setScans((prev) => prev.filter((s) => s.uuid !== item.uuid));
          removeScan(item.uuid);
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const { friendlyLabel, crop } = parseDiseaseLabel(item.disease, lang);
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
        onPress={() => navigation.navigate("ScanDetail", { scan: item })}
        activeOpacity={0.7}
      >
        <View style={styles.row}>
          {item.image_url || item.image_uri ? (
            <Image
              source={{ uri: item.image_url || item.image_uri }}
              style={[styles.thumb, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[styles.thumb, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
            >
              <Leaf size={22} color={c.accent} strokeWidth={2} />
            </View>
          )}

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <View style={[styles.dot, { backgroundColor: statusColor(item, c) }]} />
              <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
                {item.unsupported ? t.diseaseUnsupported : friendlyLabel}
              </Text>
            </View>
            <Text style={[styles.meta, { color: c.textMuted }]} numberOfLines={1}>
              {[crop, `${Math.round(item.confidence)}%`, formatDate(item.created_at, lang)]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.deleteBtn, { borderColor: c.border }]}
            onPress={() => confirmDelete(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.6}
          >
            <Trash2 size={16} color={c.danger} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (!loading && scans.length === 0) {
    return (
      <Screen c={c}>
        <View style={styles.emptyWrap}>
          <Text style={[styles.pageTitle, { color: c.text }]}>{t.scanHistory}</Text>
          <Text style={[styles.pageSubtitle, { color: c.textMuted }]}>
            {t.historySubtitle}
          </Text>
          <View style={styles.emptyBody}>
            <View style={[styles.emptyIconBox, { backgroundColor: c.accentSoft }]}>
              <History size={28} color={c.accentText} strokeWidth={2} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.text }]}>{t.historyEmptyTitle}</Text>
            <Text style={[styles.emptyText, { color: c.textMuted }]}>{t.historyEmpty}</Text>
            <TouchableOpacity
              style={[styles.cta, { backgroundColor: c.accent }]}
              onPress={() => navigation.navigate("QuickAction")}
              activeOpacity={0.85}
            >
              <Leaf size={16} color={c.primaryForeground || "#FFFFFF"} strokeWidth={2} />
              <Text style={[styles.ctaText, { color: c.primaryForeground || "#FFFFFF" }]}>
                {t.scanNow}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen c={c}>
      <View style={styles.flex}>
        <Text style={[styles.pageTitle, { color: c.text }]}>{t.scanHistory}</Text>
        <Text style={[styles.pageSubtitle, { color: c.textMuted }]}>
          {t.historySubtitle}
        </Text>
        <FlatList
          data={scans}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
  },
  pageSubtitle: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 18,
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, gap: 6 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: { flex: 1, fontSize: 15, fontWeight: "600" },
  meta: { fontSize: 12 },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyWrap: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
  },
  emptyBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", marginBottom: 6 },
  emptyText: { fontSize: 13, textAlign: "center", lineHeight: 19, marginBottom: 20 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    minHeight: 44,
    borderRadius: 12,
  },
  ctaText: { fontSize: 14, fontWeight: "600" },
});
