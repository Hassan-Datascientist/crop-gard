import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LANG_FLAGS, LANG_NAMES } from "../constants/translations";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LANGS = ["en", "rw", "fr", "ar"];

// Bottom sheet language picker (mirrors the web LanguageSwitcher dropdown).
export default function LanguageSheet({ visible, onClose, lang, onSelect, c }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={[styles.sheet, { backgroundColor: c.surface }, { paddingBottom: Math.max(insets.bottom, 20) }]}
          activeOpacity={1}
        >
          <View style={[styles.handle, { backgroundColor: c.borderStrong }]} />
          <Text style={[styles.title, { color: c.text }]}>Language</Text>
          {LANGS.map((l) => {
            const active = lang === l;
            return (
              <TouchableOpacity
                key={l}
                style={[styles.row, { borderColor: active ? c.accent : c.border, backgroundColor: active ? c.accentSoft : "transparent" }]}
                onPress={() => {
                  onSelect(l);
                  onClose();
                }}
                activeOpacity={0.75}
              >
                <Text style={styles.flag}>{LANG_FLAGS[l]}</Text>
                <Text style={[styles.name, { color: active ? c.accentText : c.text }]}>
                  {LANG_NAMES[l]}
                </Text>
                {active ? (
                  <Ionicons name="checkmark" size={16} color={c.accentText} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: -4 } },
      android: { elevation: 16 },
    }),
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 8,
  },
  flag: { fontSize: 18 },
  name: { flex: 1, fontSize: 15, fontWeight: "600" },
});
