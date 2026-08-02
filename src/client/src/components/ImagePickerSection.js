import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ImagePickerSection({ image, t, c, onPick }) {
  return (
    <>
      <TouchableOpacity
        style={[styles.preview, { backgroundColor: c.surfaceAlt, borderColor: image ? c.accent : c.border }]}
        onPress={() => onPick(false)}
        activeOpacity={0.85}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImg} resizeMode="cover" />
        ) : (
          <View style={styles.previewEmpty}>
            <Ionicons name="image-outline" size={36} color={c.textFaint} />
            <Text style={[styles.previewHint, { color: c.textMuted }]}>{t.placeholder}</Text>
            <Text style={[styles.previewTap, { color: c.accent }]}>Tap to select</Text>
          </View>
        )}
      </TouchableOpacity>

      {!image && (
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => onPick(false)}
            activeOpacity={0.75}
          >
            <View style={styles.btnIconWrap}>
              <Ionicons name="images-outline" size={17} color={c.textMuted} />
              <Text style={[styles.secondaryBtnText, { color: c.text }]}>{t.gallery}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => onPick(true)}
            activeOpacity={0.75}
          >
            <View style={styles.btnIconWrap}>
              <Ionicons name="camera-outline" size={17} color={c.textMuted} />
              <Text style={[styles.secondaryBtnText, { color: c.text }]}>{t.camera}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    marginBottom: 14,
  },
  previewImg: { width: "100%", height: "100%" },
  previewEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  previewHint: { fontSize: 14, fontWeight: "500" },
  previewTap: { fontSize: 12, fontWeight: "600" },
  btnRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnIconWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  secondaryBtnText: { fontSize: 14, fontWeight: "600" },
});
