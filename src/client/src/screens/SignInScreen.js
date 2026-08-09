import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useApp } from "../context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInScreen({ navigation }) {
  const { t, c, signIn } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError(t.fillAllFields);
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError(t.invalidEmail);
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(e.message === "INVALID_CREDENTIALS" ? t.invalidCredentials : e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen c={c}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.iconTile, { backgroundColor: c.accentDeep }]}>
            <Ionicons name="log-in" size={26} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, { color: c.text }]}>{t.signInTitle}</Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            {t.signInSubtitle}
          </Text>

          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            <FormInput
              label={t.email}
              c={c}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <FormInput
              label={t.password}
              c={c}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: c.dangerSoft }]}>
                <Text style={[styles.errorText, { color: c.danger }]}>{error}</Text>
              </View>
            ) : null}

            <PrimaryButton
              title={t.signIn}
              onPress={handleSubmit}
              loading={loading}
              c={c}
              style={styles.submitBtn}
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.link}
            activeOpacity={0.7}
          >
            <Text style={[styles.linkText, { color: c.textMuted }]}>
              {t.noAccount}{" "}
              <Text style={{ color: c.accentText, fontWeight: "700" }}>
                {t.getStartedNow}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 72 : 56,
    paddingBottom: 40,
  },
  iconTile: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center", letterSpacing: -0.5 },
  subtitle: {
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 28,
    marginTop: 6,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  errorBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, fontWeight: "500", lineHeight: 18 },
  submitBtn: { marginBottom: 16 },
  link: { alignItems: "center", paddingVertical: 12, marginTop: 8 },
  linkText: { fontSize: 13 },
});
