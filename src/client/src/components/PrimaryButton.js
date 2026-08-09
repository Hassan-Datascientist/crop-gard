import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  c,
  style,
}) {
  const fg = c.primaryForeground || "#FFFFFF";
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: c.accent },
        (disabled || loading) && { opacity: 0.7 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <Text style={[styles.text, { color: fg }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});

