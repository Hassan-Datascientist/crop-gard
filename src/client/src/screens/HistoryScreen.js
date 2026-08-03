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
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { getScans } from "../db/database";
import { parseDiseaseLabel } from "../utils/parseDiseaseLabel";
import { formatDate } from "../utils/formatDate";

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
        onPress: () => removeScan(item.uuid),
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const { diseaseName, isHealthy } = parseDiseaseLabel(item.disease);
    return (
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
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
              <Ionicons name="leaf" size={22} color={c.accent} />
            </View>
          )}

          <View style={styles.info}>
            <View style={styles.topRow}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: item.unsupported
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
                      color: item.unsupported
                        ? c.warning
                        : isHealthy
                          ? c.accentText
                          : c.danger,
                    },
                  ]}
                >
                  {item.unsupported ? t.diseaseUnsupported : diseaseName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => confirmDelete(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.6}
              >
                <Ionicons name="trash-outline" size={18} color={c.textFaint} />
              </TouchableOpacity>
            </View>
            <View style={styles.bottomRow}>
              <Text style={[styles.confidence, { color: c.text }]}>
                {Math.round(item.confidence)}%
              </Text>
              <Text style={[styles.date, { color: c.textMuted }]}>
                {formatDate(item.created_at, lang)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (!loading && scans.length === 0) {
    return (
      <View style={[styles.emptyWrap, { backgroundColor: c.bg }]}>
        <Text style={[styles.pageTitle, { color: c.text }]}>{t.scanHistory}</Text>
        <Ionicons
          name="time-outline"
          size={40}
          color={c.textFaint}
          style={styles.emptyIcon}
        />
        <Text style={[styles.emptyText, { color: c.textMuted }]}>{t.historyEmpty}</Text>
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: c.accent }]}
          onPress={() => navigation.navigate("QuickAction")}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>{t.scanNow}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <Text style={[styles.pageTitle, { color: c.text }]}>{t.scanHistory}</Text>
      <FlatList
        data={scans}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.4,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingBottom: 16,
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 7 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 7,
  },
  confidence: { fontSize: 14, fontWeight: "700" },
  date: { fontSize: 12 },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
  },
  emptyIcon: { textAlign: "center", marginTop: 60, marginBottom: 12 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  cta: { alignSelf: "center", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  ctaText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
