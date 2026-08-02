import React from "react";
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
import PrimaryButton from "../components/PrimaryButton";

const BENEFIT_ICONS = ["shield-checkmark", "sparkles", "language"];

export default function WelcomeScreen({ navigation }) {
  const { t, c } = useApp();
  const benefits = [t.benefit1, t.benefit2, t.benefit3];

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { backgroundColor: c.accentSoft }]}>
        <Ionicons name="leaf" size={56} color={c.accent} />
      </View>

      <Text style={[styles.title, { color: c.text }]}>{t.welcomeTitle}</Text>
      <Text style={[styles.subtitle, { color: c.textMuted }]}>
        {t.welcomeSubtitle}
      </Text>

      <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
        {t.whyTitle}
      </Text>

      <View style={styles.benefits}>
        {benefits.map((benefit, i) => (
          <View
            key={i}
            style={[styles.benefitRow, { backgroundColor: c.surface, borderColor: c.border }]}
          >
            <View style={[styles.benefitIcon, { backgroundColor: c.accentSoft }]}>
              <Ionicons
                name={BENEFIT_ICONS[i]}
                size={18}
                color={c.accentText}
              />
            </View>
            <Text style={[styles.benefitText, { color: c.text }]}>{benefit}</Text>
          </View>
        ))}
      </View>

      <PrimaryButton
        title={t.getStarted}
        onPress={() => navigation.navigate("EmailPassword")}
        c={c}
        style={styles.submitBtn}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate("SignIn")}
        style={styles.link}
        activeOpacity={0.7}
      >
        <Text style={[styles.linkText, { color: c.textMuted }]}>
          {t.haveAccount}{" "}
          <Text style={{ color: c.accent, fontWeight: "700" }}>{t.signInNow}</Text>
        </Text>
      </TouchableOpacity>
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
  hero: {
    alignSelf: "center",
    width: 104,
    height: 104,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 27,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  benefits: { gap: 10, marginBottom: 28 },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  benefitIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: { flex: 1, fontSize: 14, lineHeight: 20 },
  submitBtn: { marginBottom: 16 },
  link: { alignItems: "center", paddingVertical: 8 },
  linkText: { fontSize: 13 },
});
