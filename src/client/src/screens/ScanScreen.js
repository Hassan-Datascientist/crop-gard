import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useInference } from "../ml/useInference";
import { useApp } from "../context/AppContext";
import { DISEASE_DETAILS } from "../constants/diseaseData";
import { parseDiseaseLabel } from "../utils/parseDiseaseLabel";
import Screen from "../components/Screen";
import AppHeader from "../components/AppHeader";
import ImagePickerSection from "../components/ImagePickerSection";
import ResultCard from "../components/ResultCard";
import LanguageSheet from "../components/LanguageSheet";

export default function ScanScreen() {
  const [image, setImage] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  const { t, c, lang, isDark, toggleTheme, addScan, setLanguage } = useApp();

  const { modelState, inferring, result, errorMessage, analyze, reset } = useInference();

  const handleImagePick = async (useCamera = false) => {
    const permResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permResult.status !== "granted") {
      Alert.alert(t.permissionRequired, t.permissionDenied);
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

  const modelBadge = () => {
    let bg, fg, text;
    if (modelState === "ready" || modelState === "idle") {
      bg = c.accentSoft;
      fg = c.accentText;
      text = modelState === "ready" ? t.modelReady : t.modelIdle;
    } else if (modelState === "error") {
      bg = c.dangerSoft;
      fg = c.danger;
      text = t.modelError;
    } else {
      bg = c.warningSoft;
      fg = c.warning;
      text = t.modelLoading;
    }
    return (
      <View style={[styles.modelBadge, { backgroundColor: bg }]}>
        <Text style={[styles.modelBadgeText, { color: fg }]}>{text}</Text>
      </View>
    );
  };

  return (
    <Screen c={c}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          c={c}
          t={t}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenLanguage={() => setLangOpen(true)}
        />

        <View style={styles.head}>
          <Text style={[styles.title, { color: c.text }]}>{t.title}</Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>{t.subtitle}</Text>
          <View style={styles.modelRow}>{modelBadge()}</View>
        </View>

        <ImagePickerSection
          image={image}
          t={t}
          c={c}
          busy={busy}
          onPick={(mode) => {
            if (mode === null) {
              setImage(null);
              reset();
            } else {
              handleImagePick(!!mode);
            }
          }}
        />

        {image && (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: busy ? c.accentSoft : c.accent, opacity: busy ? 0.7 : 1 }]}
            onPress={processImage}
            disabled={busy}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator color={c.primaryForeground || "#FFFFFF"} size="small" />
            ) : (
              <Text style={[styles.primaryBtnText, { color: c.primaryForeground || "#FFFFFF" }]}>
                {t.button}
              </Text>
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

        <LanguageSheet
          visible={langOpen}
          onClose={() => setLangOpen(false)}
          lang={lang}
          onSelect={setLanguage}
          c={c}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingBottom: 40,
  },
  head: { marginBottom: 18 },
  title: { fontSize: 24, fontWeight: "700", letterSpacing: -0.5 },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  modelRow: { marginTop: 10 },
  modelBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  modelBadgeText: { fontSize: 11, fontWeight: "600", letterSpacing: 0.2 },
  primaryBtn: {
    width: "100%",
    minHeight: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  primaryBtnText: { fontSize: 15, fontWeight: "600", letterSpacing: 0.2 },
  secondaryActionBtn: {
    width: "100%",
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  secondaryActionText: { fontSize: 13, fontWeight: "600" },
  bottomSpacer: { height: 20 },
});
