import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

export default function FormInput({ label, c, style, ...props }) {
  return (
    <View style={[styles.field, style]}>
      {label ? (
        <Text style={[styles.label, { color: c.textMuted }]}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={c.textFaint}
        style={[
          styles.input,
          {
            backgroundColor: c.surface,
            borderColor: c.border,
            color: c.text,
          },
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
});
