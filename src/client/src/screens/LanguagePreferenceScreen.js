import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { LANG_FLAGS, LANG_NAMES } from "../constants/translations";
import PrimaryButton from "../components/PrimaryButton";
import OnboardingHeader from "../components/OnboardingHeader";

const LANGS = ["en", "rw", "fr", "ar"];

export default function LanguagePreferenceScreen({ navigation, route }) {
  const { t, c, register } = useApp();
  const params = route.params || {};
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateAccount = async () => {
    setError(null);
    setLoading(true);
    try {
      await register({
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        password: params.password,
        language: lang,
      });
    } catch (e) {
      setError(e.message === "EMAIL_IN_USE" ? t.emailInUse : e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <OnboardingHeader
        step={3}
        total={3}
        title={t.stepLanguageTitle}
        subtitle={t.stepLanguageSubtitle}
        c={c}
        onBack={() => navigation.goBack()}
      />

      <View
        style={[styles.langBar, { backgroundColor: c.surface, borderColor: c.border }]}
      >
        {LANGS.map((l) => {
          const active = lang === l;
          return (
            <TouchableOpacity
              key={l}
              style={[
                styles.langPill,
                {
                  backgroundColor: active ? c.accent : "transparent",
                  borderColor: active ? c.accent : c.border,
                },
              ]}
              onPress={() => setLang(l)}
              activeOpacity={0.75}
            >
              {active ? (
                <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
              ) : null}
              <Text
                style={[
                  styles.langPillText,
                  { color: active ? "#FFFFFF" : c.textMuted },
                ]}
              >
                {LANG_FLAGS[l]} {l.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.langName, { color: c.textMuted }]}>
        {LANG_NAMES[lang]}
      </Text>

      {error ? (
        <Text style={[styles.error, { color: c.danger }]}>{error}</Text>
      ) : null}

      <PrimaryButton
        title={t.createAccount}
        onPress={handleCreateAccount}
        loading={loading}
        c={c}
        style={styles.submitBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 72 : 56,
    paddingBottom: 40,
  },
  langBar: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 5,
    gap: 4,
    marginBottom: 12,
  },
  langPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 3,
  },
  langPillText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  langName: { fontSize: 13, textAlign: "center", marginBottom: 24 },
  error: { fontSize: 13, marginBottom: 14, textAlign: "center" },
  submitBtn: { marginBottom: 16 },
});
