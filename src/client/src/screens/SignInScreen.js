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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.flex, { backgroundColor: c.bg }]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoWrap}>
          <Ionicons name="leaf" size={48} color={c.accent} />
        </View>
        <Text style={[styles.title, { color: c.text }]}>{t.signInTitle}</Text>
        <Text style={[styles.subtitle, { color: c.textMuted }]}>
          {t.signInSubtitle}
        </Text>

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
          <Text style={[styles.error, { color: c.danger }]}>{error}</Text>
        ) : null}

        <PrimaryButton
          title={t.signIn}
          onPress={handleSubmit}
          loading={loading}
          c={c}
          style={styles.submitBtn}
        />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.link}
          activeOpacity={0.7}
        >
          <Text style={[styles.linkText, { color: c.textMuted }]}>
            {t.noAccount}{" "}
            <Text style={{ color: c.accent, fontWeight: "700" }}>
              {t.getStartedNow}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 80 : 56,
    paddingBottom: 40,
  },
  logoWrap: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 26, fontWeight: "700", textAlign: "center", letterSpacing: -0.4 },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 28,
    marginTop: 6,
  },
  error: { fontSize: 13, marginBottom: 14, textAlign: "center" },
  submitBtn: { marginBottom: 16 },
  link: { alignItems: "center", paddingVertical: 8 },
  linkText: { fontSize: 13 },
});
