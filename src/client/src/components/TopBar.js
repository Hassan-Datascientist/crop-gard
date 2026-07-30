import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";

export default function TopBar({ title, t, modelState, isDark, onToggleTheme, c }) {
  const modelBadge = () => {
    let bg, fg, text;
    if (modelState === "idle") {
      bg = c.surfaceAlt; fg = c.textMuted; text = t.modelIdle;
    } else if (modelState === "ready") {
      bg = c.accentSoft; fg = c.accentText; text = t.modelReady;
    } else if (modelState === "error") {
      bg = isDark ? "#3D1C1C" : "#FFEEF0"; fg = c.danger; text = t.modelError;
    } else {
      bg = isDark ? "#3D1C1C" : "#FFEEF0"; fg = c.warning; text = t.modelLoading;
    }
    return (
      <View style={[styles.modelBadge, { backgroundColor: bg }]}>
        <Text style={[styles.modelBadgeText, { color: fg }]}>{text}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.topBar, { borderBottomColor: c.border }]}>
      <View>
        <Text style={[styles.appTitle, { color: c.text }]}>{title}</Text>
        {modelBadge()}
      </View>
      <TouchableOpacity
        style={[styles.themeBtn, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
        onPress={onToggleTheme}
        activeOpacity={0.7}
      >
        <Text style={[styles.themeBtnText, { color: c.textMuted }]}>
          {isDark ? "☀️" : "🌙"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  modelBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  modelBadgeText: { fontSize: 11, fontWeight: "600", letterSpacing: 0.2 },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  themeBtnText: { fontSize: 18 },
});
