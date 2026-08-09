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
import Screen from "../components/Screen";
import PrimaryButton from "../components/PrimaryButton";

const BENEFIT_ICONS = ["shield-checkmark", "sparkles", "language"];

export default function WelcomeScreen({ navigation }) {
  const { t, c } = useApp();
  const benefits = [t.benefit1, t.benefit2, t.benefit3];

  return (
    <Screen c={c}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroTile, { backgroundColor: c.accentDeep }]}>
          <Ionicons name="leaf" size={30} color="#FFFFFF" />
        </View>

        <Text style={[styles.title, { color: c.text }]}>{t.welcomeTitle}</Text>
        <Text style={[styles.subtitle, { color: c.textMuted }]}>
          {t.welcomeSubtitle}
        </Text>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
            {t.whyTitle}
          </Text>

          <View style={styles.benefits}>
            {benefits.map((benefit, i) => (
              <View key={i} style={styles.benefitRow}>
                <View style={[styles.benefitIcon, { backgroundColor: c.accentSoft }]}>
                  <Ionicons
                    name={BENEFIT_ICONS[i]}
                    size={18}
                    color={c.accentText}
                  />
                </View>
                <Text style={[styles.benefitText, { color: c.text }]}>
                  {benefit}
                </Text>
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
              <Text style={{ color: c.accentText, fontWeight: "700" }}>
                {t.signInNow}
              </Text>
            </Text>
          </TouchableOpacity>
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
  heroTile: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  benefits: { gap: 10, marginBottom: 24 },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
