import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useInference } from "../ml/useInference";
import { useApp } from "../context/AppContext";
import { DISEASE_DETAILS } from "../constants/diseaseData";
import { parseDiseaseLabel } from "../utils/parseDiseaseLabel";
import TopBar from "../components/TopBar";
import ImagePickerSection from "../components/ImagePickerSection";
import ResultCard from "../components/ResultCard";

export default function ScanScreen() {
  const [image, setImage] = useState(null);
  const { t, c, lang, isDark, toggleTheme, addScan } = useApp();

  const { modelState, inferring, result, errorMessage, analyze, reset } = useInference();

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
      return;
    }
    if (inferenceResult) {
      await addScan({
        imageUri: image,
        disease: inferenceResult.disease,
        confidence: inferenceResult.confidence,
        unsupported: inferenceResult.unsupported,
      });
    }
  };

  const getRemedy = (rawLabel, unsupported) => {
    if (unsupported) {
      return DISEASE_DETAILS[lang]?.unknown || DISEASE_DETAILS.en.unknown;
    }
    const key = parseDiseaseLabel(rawLabel, lang).detailKey || "healthy";
    return (
      DISEASE_DETAILS[lang]?.[key] ||
      DISEASE_DETAILS.en[key] ||
      DISEASE_DETAILS.en.unknown || { cause: "-", treatment: "-" }
    );
  };

  const getResultWithDetails = () => {
    if (!result) return null;
    const remedy = getRemedy(result.disease, result.unsupported);
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

      <TopBar title={t.title} t={t} modelState={modelState} isDark={isDark} onToggleTheme={toggleTheme} c={c} />

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

      <ResultCard result={getResultWithDetails()} t={t} c={c} lang={lang} />

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
