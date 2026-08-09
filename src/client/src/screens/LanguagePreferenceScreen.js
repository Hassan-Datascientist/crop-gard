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
import Screen from "../components/Screen";

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
    <Screen c={c}>
      <ScrollView
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

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={[styles.langBar, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
            {LANGS.map((l) => {
              const active = lang === l;
              return (
                <TouchableOpacity
                  key={l}
                  style={[
                    styles.langPill,
                    {
                      backgroundColor: active ? c.accent : "transparent",
                      borderColor: active ? c.accent : "transparent",
                    },
                  ]}
                  onPress={() => setLang(l)}
                  activeOpacity={0.75}
                >
                  {active ? (
                    <Ionicons name="checkmark-circle" size={12} color={c.primaryForeground || "#FFFFFF"} />
                  ) : null}
                  <Text
                    style={[
                      styles.langPillText,
                      { color: active ? (c.primaryForeground || "#FFFFFF") : c.textMuted },
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
            <View style={[styles.errorBox, { backgroundColor: c.dangerSoft }]}>
              <Text style={[styles.errorText, { color: c.danger }]}>{error}</Text>
            </View>
          ) : null}

          <PrimaryButton
            title={t.createAccount}
            onPress={handleCreateAccount}
            loading={loading}
            c={c}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 72 : 56,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  langBar: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 5,
    gap: 4,
    marginBottom: 14,
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
  langName: { fontSize: 13, textAlign: "center", marginBottom: 20 },
  errorBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, fontWeight: "500", lineHeight: 18 },
});
