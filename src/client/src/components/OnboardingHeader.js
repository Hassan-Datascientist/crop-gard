import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function OnboardingHeader({ step, total, title, subtitle, c, onBack }) {
  return (
    <View>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backBtn, { backgroundColor: c.surface, borderColor: c.border }]}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={20} color={c.textMuted} />
        </TouchableOpacity>

        <View style={styles.dots}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i < step ? c.accent : c.border },
              ]}
            />
          ))}
        </View>

        <View style={styles.backBtnPlaceholder} />
      </View>

      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: c.textMuted }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnPlaceholder: { width: 40 },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 24, fontWeight: "700", letterSpacing: -0.4 },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 24 },
});
