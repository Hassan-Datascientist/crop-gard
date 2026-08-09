import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Globe, Leaf, Moon, Sun } from "lucide-react-native";

// Sticky app header: emerald logo tile + name, then theme toggle and
// language pill on the right (mirrors the web AppLayout).
export default function AppHeader({
  c,
  t,
  isDark,
  onToggleTheme,
  onOpenLanguage,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <View style={[styles.logoTile, { backgroundColor: c.accentDeep }]}>
          <Leaf size={20} color="#FFFFFF" strokeWidth={2} />
        </View>
        <View>
          <Text style={[styles.appName, { color: c.text }]}>{t.appName}</Text>
          <Text style={[styles.tagline, { color: c.textMuted }]}>
            {t.tagline}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={onToggleTheme}
          activeOpacity={0.7}
          accessibilityLabel="Toggle theme"
        >
          {isDark ? (
            <Sun size={18} color={c.textMuted} strokeWidth={2} />
          ) : (
            <Moon size={18} color={c.textMuted} strokeWidth={2} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={onOpenLanguage}
          activeOpacity={0.7}
          accessibilityLabel="Language"
        >
          <Globe size={18} color={c.textMuted} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    marginBottom: 8,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: { fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  tagline: { fontSize: 11, marginTop: 1 },
  actions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
