// src/screens/ScanScreen.js
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadLeafImage } from "../services/api";
import { SUPPORTED_CROPS } from "../services/api";

const TRANSLATIONS = {
  en: {
    title: "CropScan AI",
    subtitle: "Photograph the symptomatic leaf area",
    gallery: "Gallery",
    camera: "Camera",
    button: "Analyse Leaf",
    report: "Diagnostic Report",
    condition: "Condition",
    confidence: "Confidence",
    cause: "Root Cause",
    treatment: "Recommended Treatment",
    placeholder: "No image selected",
    healthy: "Healthy",
  },
  rw: {
    title: "CropScan AI",
    subtitle: "Fata ifoto y'ikimera kirwaye",
    gallery: "Ububiko",
    camera: "Kamera",
    button: "Suzuma Ikimera",
    report: "Iripoti y'Isuzuma",
    condition: "Indwara",
    confidence: "Ikizere",
    cause: "Imvano",
    treatment: "Ubuvuzi Bwasabwe",
    placeholder: "Nta foto yashyizweho",
    healthy: "Nziza",
  },
  fr: {
    title: "CropScan AI",
    subtitle: "Photographiez la zone symptomatique",
    gallery: "Galerie",
    camera: "Caméra",
    button: "Analyser la Feuille",
    report: "Rapport de Diagnostic",
    condition: "Condition",
    confidence: "Confiance",
    cause: "Cause Principale",
    treatment: "Traitement Recommandé",
    placeholder: "Aucune image sélectionnée",
    healthy: "Saine",
  },
  ar: {
    title: "CropScan AI",
    subtitle: "التقط صورة للمنطقة المصابة",
    gallery: "المعرض",
    camera: "الكاميرا",
    button: "تحليل الورقة",
    report: "تقرير التشخيص",
    condition: "الحالة",
    confidence: "الثقة",
    cause: "السبب الجذري",
    treatment: "العلاج الموصى به",
    placeholder: "لا توجد صورة",
    healthy: "سليم",
  },
};

const DISEASE_DETAILS = {
  en: {
    blight: {
      cause: "Fungal pathogens thriving in warm, humid conditions.",
      treatment:
        "Apply copper-based fungicides. Rotate crops and clear debris after harvest.",
    },
    "early blight": {
      cause:
        "Alternaria solani fungus attacking older foliage under alternating wet and dry conditions.",
      treatment:
        "Apply protectant fungicides (like chlorothalonil or mancozeb). Space plants out and irrigate early in the day.",
    },
    "common rust": {
      cause: "Puccinia sorghi spores spread by wind across fields.",
      treatment:
        "Use rust-resistant hybrids. Apply triazole fungicides if infection exceeds 10%.",
    },
    "gray leaf spot": {
      cause: "Cercospora zeae-maydis overwintering in crop residue.",
      treatment:
        "Improve drainage, practice annual rotation, and apply foliar fungicides.",
    },
    healthy: {
      cause: "Optimal nutrition and strong immune response.",
      treatment:
        "Maintain standard irrigation and nitrogen-balanced fertilisation.",
    },
  },
  rw: {
    blight: {
      cause: "Ibihumyo bikura cyane mu bushyuhe n'uburyohe.",
      treatment: "Gukoresha imiti. Guhinduranya ibihingwa.",
    },
    "early blight": {
      cause:
        "Igihumyo cya Alternaria solani kiba mu bishandza n'amababi bishaje.",
      treatment:
        "Gukoresha imiti yabugenewe (Fungicides). Kuvomera mu gitondo amababi agakuka kare.",
    },
    "common rust": {
      cause: "Udusanduku tw'indwara uterwa n'umuyaga.",
      treatment: "Guhinga imbuto zihanganira indwara no gukoresha imiti kare.",
    },
    healthy: {
      cause: "Ikimera gifite imirire myiza n'ubudahangarwa bukomeye.",
      treatment: "Komeza kuvomera neza no gushyiramo ifumbire.",
    },
  },
  fr: {
    blight: {
      cause: "Champignons pathogènes par temps chaud et humide.",
      treatment:
        "Appliquer des fongicides cupriques. Pratiquer la rotation des cultures.",
    },
    "early blight": {
      cause:
        "Champignon Alternaria solani attaquant le feuillage par alternance de temps sec et humide.",
      treatment:
        "Appliquer des fongicides protecteurs. Espacer les plants pour une meilleure aération.",
    },
    healthy: {
      cause: "Nutrition optimale et défenses immunitaires fortes.",
      treatment:
        "Maintenir l'arrosage standard et une fertilisation équilibrée.",
    },
  },
  ar: {
    blight: {
      cause: "فطريات تزدهر في الظروف الدافئة والرطبة.",
      treatment: "تطبيق مبيدات نحاسية وتدوير المحاصيل.",
    },
    "early blight": {
      cause: "فطر ألترناريا سولاني الذي يهاجم الأوراق القديمة في ظروف متقلبة.",
      treatment: "استخدام مبيدات الفطريات الوقائية وتحسين تهوية النباتات.",
    },
    healthy: {
      cause: "تغذية ممتالية ودفاعات مناعية قوية.",
      treatment: "الحفاظ على جداول الري والتسميد المتوازن.",
    },
  },
};

const LANG_FLAGS = { en: "🇬🇧", rw: "🇷🇼", fr: "🇫🇷", ar: "🇸🇦" };

const CROP_LABELS = {
  maize: { en: "Maize", rw: "Ibigori", fr: "Maïs", ar: "ذرة" },
  potato: { en: "Potato", rw: "Ibirayi", fr: "Pomme de terre", ar: "بطاطس" },
  beans: { en: "Beans", rw: "Ibishyimbo", fr: "Haricots", ar: "فاصوليا" },
};

const DARK = {
  bg: "#0D1117",
  surface: "#161B22",
  surfaceAlt: "#1C2128",
  border: "#30363D",
  borderStrong: "#484F58",
  text: "#E6EDF3",
  textMuted: "#8B949E",
  textFaint: "#484F58",
  accent: "#3FB950",
  accentSoft: "#1B4D2E",
  accentText: "#56D364",
  warning: "#D29922",
  danger: "#F85149",
};

const LIGHT = {
  bg: "#F6F8FA",
  surface: "#FFFFFF",
  surfaceAlt: "#F0F3F6",
  border: "#D0D7DE",
  borderStrong: "#AFB8C1",
  text: "#1F2328",
  textMuted: "#656D76",
  textFaint: "#CFD4DA",
  accent: "#1A7F37",
  accentSoft: "#DAFBE1",
  accentText: "#1A7F37",
  warning: "#9A6700",
  danger: "#CF222E",
};

export default function ScanScreen({ cropName, endpoint }) {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState("maize"); // default selection
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [lang, setLang] = useState("en");
  const [isDark, setIsDark] = useState(true);

  const c = isDark ? DARK : LIGHT;
  const t = TRANSLATIONS[lang];

  const handleImagePick = async (useCamera = false) => {
    const permResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permResult.status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow camera or gallery access to continue.",
      );
      return;
    }

    const options = { allowsEditing: true, aspect: [1, 1], quality: 0.92 };
    const picked = useCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!picked.canceled) {
      setImage(picked.assets[0].uri);
      setResult(null);
    }
  };

  const parseDiseaseLabel = (rawLabel) => {
    if (!rawLabel)
      return { crop: "", diseaseName: "Unknown", isHealthy: false };
    const [crop, ...rest] = rawLabel.split("___");
    const diseaseName = rest.length
      ? rest.join(" ").replace(/_/g, " ")
      : rawLabel;
    return {
      crop,
      diseaseName,
      isHealthy: diseaseName.toLowerCase() === "healthy",
    };
  };

  const processImage = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const data = await uploadLeafImage(image, crop);
      setResult(data);
    } catch {
      Alert.alert(
        "Connection Error",
        "Unable to reach the inference server. Please check your network and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getRemedy = (name) => {
    const key = name?.toLowerCase().trim() || "healthy";
    return (
      DISEASE_DETAILS[lang]?.[key] ||
      DISEASE_DETAILS.en?.[key] || { cause: "—", treatment: "—" }
    );
  };

  // const isHealthy = result?.disease?.toLowerCase().trim() === "healthy";
  const isHealthy = parseDiseaseLabel(result?.disease).isHealthy;
  const confidenceNum = parseFloat(result?.confidence || 0);
  const confidenceColor =
    confidenceNum >= 80 ? c.accent : confidenceNum >= 55 ? c.warning : c.danger;

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: c.border }]}>
        <View>
          <Text style={[styles.appTitle, { color: c.text }]}>{t.title}</Text>
          {cropName ? (
            <View style={[styles.cropBadge, { backgroundColor: c.accentSoft }]}>
              <Text style={[styles.cropBadgeText, { color: c.accentText }]}>
                {cropName}
              </Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity
          style={[
            styles.themeBtn,
            { backgroundColor: c.surfaceAlt, borderColor: c.border },
          ]}
          onPress={() => setIsDark((d) => !d)}
          activeOpacity={0.7}
        >
          <Text style={[styles.themeBtnText, { color: c.textMuted }]}>
            {isDark ? "☀️" : "🌙"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language Selector */}
      <View
        style={[
          styles.langBar,
          { backgroundColor: c.surface, borderColor: c.border },
        ]}
      >
        {["en", "rw", "fr", "ar"].map((l) => (
          <TouchableOpacity
            key={l}
            style={[
              styles.langPill,
              {
                backgroundColor: lang === l ? c.accent : "transparent",
                borderColor: lang === l ? c.accent : c.border,
              },
            ]}
            onPress={() => setLang(l)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.langPillText,
                { color: lang === l ? "#FFFFFF" : c.textMuted },
              ]}
            >
              {LANG_FLAGS[l]} {l.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.subtitle, { color: c.textMuted }]}>
        {t.subtitle}
      </Text>

      {/* Crop Selector */}
      <View style={styles.cropSelectorWrap}>
        <Text style={[styles.cropSelectorLabel, { color: c.textMuted }]}>
          Select Crop
        </Text>
        <View
          style={[
            styles.cropSelectorRow,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          {SUPPORTED_CROPS.map((cropKey) => {
            const active = crop === cropKey;
            return (
              <TouchableOpacity
                key={cropKey}
                style={[
                  styles.cropChip,
                  {
                    backgroundColor: active ? c.accent : "transparent",
                    borderColor: active ? c.accent : c.border,
                  },
                ]}
                onPress={() => {
                  setCrop(cropKey);
                  setResult(null); // clear stale result from a different crop
                }}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.cropChipText,
                    { color: active ? "#FFFFFF" : c.text },
                  ]}
                >
                  {CROP_LABELS[cropKey][lang] || CROP_LABELS[cropKey].en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Image Preview */}
      <TouchableOpacity
        style={[
          styles.preview,
          {
            backgroundColor: c.surfaceAlt,
            borderColor: image ? c.accent : c.border,
          },
        ]}
        onPress={() => handleImagePick(false)}
        activeOpacity={0.85}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.previewImg}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.previewEmpty}>
            <Text style={[styles.previewIcon, { color: c.textFaint }]}>📷</Text>
            <Text style={[styles.previewHint, { color: c.textMuted }]}>
              {t.placeholder}
            </Text>
            <Text style={[styles.previewTap, { color: c.accent }]}>
              Tap to select
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[
            styles.secondaryBtn,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
          onPress={() => handleImagePick(false)}
          activeOpacity={0.75}
        >
          <Text style={[styles.secondaryBtnText, { color: c.text }]}>
            🖼️ {t.gallery}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.secondaryBtn,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
          onPress={() => handleImagePick(true)}
          activeOpacity={0.75}
        >
          <Text style={[styles.secondaryBtnText, { color: c.text }]}>
            📷 {t.camera}
          </Text>
        </TouchableOpacity>
      </View>

      {image && (
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            {
              backgroundColor: loading ? c.accentSoft : c.accent,
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={processImage}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>{t.button}</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Result Card */}
      {/* {result && (
        <View
          style={[
            styles.resultCard,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <View style={[styles.resultHeader, { borderBottomColor: c.border }]}>
            <Text style={[styles.resultHeaderText, { color: c.textMuted }]}>
              📊 {t.report}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.conditionBadge,
                {
                  backgroundColor: isHealthy
                    ? c.accentSoft
                    : isDark
                      ? "#3D1C1C"
                      : "#FFEEF0",
                },
              ]}
            >
              <Text
                style={[
                  styles.conditionText,
                  { color: isHealthy ? c.accentText : c.danger },
                ]}
              >
                {isHealthy ? "✅" : "⚠️"} {result.disease}
              </Text>
            </View>
          </View>

          <View style={styles.confidenceSection}>
            <View style={styles.confidenceLabel}>
              <Text style={[styles.labelText, { color: c.textMuted }]}>
                {t.confidence}
              </Text>
              <Text
                style={[styles.confidenceValue, { color: confidenceColor }]}
              >
                {Math.round(confidenceNum)}%
              </Text>
            </View>
            <View style={[styles.barBg, { backgroundColor: c.surfaceAlt }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min(confidenceNum, 100)}%`,
                    backgroundColor: confidenceColor,
                  },
                ]}
              />
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: c.border }]} />

          <View style={styles.infoSection}>
            <Text style={[styles.infoLabel, { color: c.textMuted }]}>
              🔬 {t.cause}
            </Text>
            <Text style={[styles.infoText, { color: c.text }]}>
              {getRemedy(result.disease).cause}
            </Text>
          </View>

          <View
            style={[
              styles.infoSection,
              styles.treatmentBox,
              { backgroundColor: c.accentSoft, borderColor: c.accent },
            ]}
          >
            <Text style={[styles.infoLabel, { color: c.accent }]}>
              🌿 {t.treatment}
            </Text>
            <Text style={[styles.infoText, { color: c.text }]}>
              {getRemedy(result.disease).treatment}
            </Text>
          </View>
        </View>
      )}*/}
      {result &&
        (() => {
          const {
            crop,
            diseaseName,
            isHealthy: healthy,
          } = parseDiseaseLabel(result.disease);
          const remedy = getRemedy(diseaseName);
          return (
            <View
              style={[
                styles.resultCard,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
            >
              <View
                style={[styles.resultHeader, { borderBottomColor: c.border }]}
              >
                <Text style={[styles.resultHeaderText, { color: c.textMuted }]}>
                  📊 {t.report}
                </Text>
              </View>

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.conditionBadge,
                    {
                      backgroundColor: healthy
                        ? c.accentSoft
                        : isDark
                          ? "#3D1C1C"
                          : "#FFEEF0",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.conditionText,
                      { color: healthy ? c.accentText : c.danger },
                    ]}
                  >
                    {healthy ? "✅" : "⚠️"} {diseaseName}
                  </Text>
                </View>
              </View>

              <View style={styles.confidenceSection}>
                <View style={styles.confidenceLabel}>
                  <Text style={[styles.labelText, { color: c.textMuted }]}>
                    {t.confidence}
                  </Text>
                  <Text
                    style={[styles.confidenceValue, { color: confidenceColor }]}
                  >
                    {Math.round(confidenceNum)}%
                  </Text>
                </View>
                <View style={[styles.barBg, { backgroundColor: c.surfaceAlt }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(confidenceNum, 100)}%`,
                        backgroundColor: confidenceColor,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: c.border }]} />

              <View style={styles.infoSection}>
                <Text style={[styles.infoLabel, { color: c.textMuted }]}>
                  🔬 {t.cause}
                </Text>
                <Text style={[styles.infoText, { color: c.text }]}>
                  {result.description || remedy.cause}
                </Text>
              </View>

              {!healthy && (
                <View
                  style={[
                    styles.infoSection,
                    styles.treatmentBox,
                    { backgroundColor: c.accentSoft, borderColor: c.accent },
                  ]}
                >
                  <Text style={[styles.infoLabel, { color: c.accent }]}>
                    🌿 {t.treatment}
                  </Text>
                  <Text style={[styles.infoText, { color: c.text }]}>
                    {result.recommendation || remedy.treatment}
                  </Text>
                </View>
              )}
            </View>
          );
        })()}

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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  cropBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cropBadgeText: { fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  themeBtnText: { fontSize: 18 },
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
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 16,
  },
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
  previewIcon: { fontSize: 36, marginBottom: 4 },
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
  secondaryBtnText: { fontSize: 14, fontWeight: "600" },
  primaryBtn: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  resultCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 20,
  },
  resultHeader: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  resultHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  statusRow: { padding: 16, paddingBottom: 8 },
  conditionBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  conditionText: { fontSize: 15, fontWeight: "700", letterSpacing: 0.1 },
  confidenceSection: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  confidenceLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelText: { fontSize: 13, fontWeight: "500" },
  confidenceValue: { fontSize: 14, fontWeight: "700" },
  barBg: { height: 6, borderRadius: 99, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 99 },
  divider: { height: 1, width: "100%" },
  infoSection: { padding: 16, gap: 6 },
  treatmentBox: {
    borderTopWidth: 1,
    borderLeftWidth: 3,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderRadius: 0,
    margin: 0,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  infoText: { fontSize: 14, lineHeight: 21 },
  bottomSpacer: { height: 20 },
  cropSelectorWrap: { marginBottom: 16 },
  cropSelectorLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  cropSelectorRow: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 5,
    gap: 6,
  },
  cropChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cropChipText: { fontSize: 13, fontWeight: "600" },
});
