import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LANG_FLAGS } from "../constants/translations";

const LANGS = ["en", "rw", "fr", "ar"];

export default function LanguageSelector({ lang, onSelect, c }) {
  return (
    <View style={[styles.langBar, { backgroundColor: c.surface, borderColor: c.border }]}>
      {LANGS.map((l) => {
        const active = lang === l;
        return (
          <TouchableOpacity
            key={l}
            style={[
              styles.langPill,
              { backgroundColor: active ? c.accent : "transparent", borderColor: active ? c.accent : c.border },
            ]}
            onPress={() => onSelect(l)}
            activeOpacity={0.75}
          >
            <Text style={[styles.langPillText, { color: active ? "#FFFFFF" : c.textMuted }]}>
              {LANG_FLAGS[l]} {l.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  langBar: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 5,
    marginBottom: 20,
    gap: 4,
  },
  langPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  langPillText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
});
