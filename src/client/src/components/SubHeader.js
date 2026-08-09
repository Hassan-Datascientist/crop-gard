import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Header for pushed sub-screens: circular back button + centered title,
// optional right action (e.g. delete).
export default function SubHeader({ title, c, onBack, onRight, rightIcon }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: c.surface, borderColor: c.border }]}
        onPress={onBack}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Back"
      >
        <Ionicons name="chevron-back" size={20} color={c.text} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
        {title}
      </Text>
      {rightIcon ? (
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={onRight}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name={rightIcon} size={18} color={c.danger} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backBtn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 6,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, fontSize: 18, fontWeight: "700", textAlign: "center" },
});
