import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, ScrollView, StatusBar, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useInference } from "../ml/useInference";
import { TRANSLATIONS } from "../constants/translations";
import { DARK, LIGHT } from "../constants/theme";
import { DISEASE_DETAILS } from "../constants/diseaseData";
import TopBar from "../components/TopBar";
import LanguageSelector from "../components/LanguageSelector";
import ImagePickerSection from "../components/ImagePickerSection";
import ResultCard from "../components/ResultCard";

function parseDiseaseLabel(rawLabel) {
  if (!rawLabel) return { crop: "", diseaseName: "Unknown", isHealthy: false };
  const [crop, ...rest] = rawLabel.split("___");
  const diseaseName = rest.length ? rest.join(" ").replace(/_/g, " ") : rawLabel;
  const trimmed = diseaseName.trim();
  return { crop, diseaseName: trimmed, isHealthy: trimmed.toLowerCase() === "healthy" };
}

export default function ScanScreen() {
  const [image, setImage] = useState(null);
  const [lang, setLang] = useState("en");
  const [isDark, setIsDark] = useState(true);

  const { modelState, inferring, result, errorMessage, analyze, reset } = useInference();

  const c = isDark ? DARK : LIGHT;
  const t = TRANSLATIONS[lang];

  const handleImagePick = async (useCamera = false) => {
    const permResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permResult.status !== "granted") {
      Alert.alert("Permission Required", "Please allow camera or gallery access to continue.");
      return;
    }
    const options = { allowsEditing: true, aspect: [1, 1], quality: 0.92 };
    const picked = useCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    if (!picked.canceled) {
      setImage(picked.assets[0].uri);
      reset();
    }
  };

  const processImage = async () => {
    if (!image) return;
    const inferenceResult = await analyze(image);
    if (!inferenceResult && errorMessage) {
      Alert.alert("Analysis Error", errorMessage || "On-device inference failed.");
    }
  };

  const getRemedy = (name, unsupported) => {
    if (unsupported) return DISEASE_DETAILS.en.unknown || { cause: "-", treatment: "-" };
    const key = name?.toLowerCase().trim() || "healthy";
    return DISEASE_DETAILS.en[key] || { cause: "-", treatment: "-" };
  };

  const getResultWithDetails = () => {
    if (!result) return null;
    const { diseaseName } = parseDiseaseLabel(result.disease);
    const remedy = getRemedy(diseaseName, result.unsupported);
    return {
      ...result,
      description: remedy.cause,
      recommendation: remedy.treatment,
    };
  };

  const busy = inferring || modelState === "loading";

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <TopBar title={t.title} t={t} modelState={modelState} isDark={isDark} onToggleTheme={() => setIsDark(d => !d)} c={c} />

      <LanguageSelector lang={lang} onSelect={setLang} c={c} />

      <Text style={[styles.subtitle, { color: c.textMuted }]}>{t.subtitle}</Text>

      <ImagePickerSection image={image} t={t} c={c} onPick={handleImagePick} />

      {image && (
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: busy ? c.accentSoft : c.accent, opacity: busy ? 0.7 : 1 }]}
          onPress={processImage}
          disabled={busy}
          activeOpacity={0.8}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>{t.button}</Text>
          )}
        </TouchableOpacity>
      )}

      {image && result && (
        <TouchableOpacity
          style={[styles.secondaryActionBtn, { borderColor: c.border }]}
          onPress={() => { setImage(null); reset(); }}
          activeOpacity={0.75}
        >
          <Text style={[styles.secondaryActionText, { color: c.textMuted }]}>{t.newScan}</Text>
        </TouchableOpacity>
      )}

      <ResultCard result={getResultWithDetails()} t={t} c={c} />

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  primaryBtn: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", letterSpacing: 0.2 },
  secondaryActionBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  secondaryActionText: { fontSize: 13, fontWeight: "600" },
  bottomSpacer: { height: 20 },
});
