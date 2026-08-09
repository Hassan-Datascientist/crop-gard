import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// LeafDropzone replica: dashed 4:3 box with icon tile, title, subtitle and
// Upload Image / Take Photo buttons.
export default function ImagePickerSection({ image, t, c, onPick, busy }) {
  if (image) {
    return (
      <View style={[styles.preview, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
        <Image source={{ uri: image }} style={styles.previewImg} resizeMode="cover" />
        {busy ? (
          <View style={styles.loadingOverlay}>
            <Ionicons name="sparkles" size={22} color="#FFFFFF" />
            <Text style={styles.loadingText}>{t.modelLoading}</Text>
          </View>
        ) : null}
        <TouchableOpacity
          style={[styles.clearBtn, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={() => onPick(null)}
          activeOpacity={0.7}
          accessibilityLabel="Clear image"
        >
          <Ionicons name="close" size={16} color={c.text} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.dropzone, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
      <View style={[styles.iconTile, { backgroundColor: c.accentSoft }]}>
        <Ionicons name="leaf" size={28} color={c.accentText} />
      </View>
      <Text style={[styles.title, { color: c.text }]}>{t.dropzoneTitle}</Text>
      <Text style={[styles.subtitle, { color: c.textMuted }]}>{t.dropzoneHint}</Text>

      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: c.accent }]}
          onPress={() => onPick(false)}
          activeOpacity={0.85}
        >
          <Ionicons name="image" size={16} color={c.primaryForeground || "#FFFFFF"} />
          <Text style={[styles.primaryBtnText, { color: c.primaryForeground || "#FFFFFF" }]}>
            {t.gallery}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.outlineBtn, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={() => onPick(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="camera" size={16} color={c.text} />
          <Text style={[styles.outlineBtnText, { color: c.text }]}>{t.camera}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dropzone: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 10,
  },
  iconTile: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 17, fontWeight: "600", textAlign: "center" },
  subtitle: { fontSize: 13, textAlign: "center", lineHeight: 19, marginBottom: 8 },
  btnRow: { flexDirection: "row", gap: 10, alignSelf: "stretch" },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    borderRadius: 12,
  },
  primaryBtnText: { fontSize: 14, fontWeight: "600" },
  outlineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  outlineBtnText: { fontSize: 14, fontWeight: "600" },
  preview: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  previewImg: { width: "100%", height: "100%" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  clearBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
