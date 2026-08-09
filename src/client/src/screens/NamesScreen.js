import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useApp } from "../context/AppContext";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import OnboardingHeader from "../components/OnboardingHeader";
import Screen from "../components/Screen";

export default function NamesScreen({ navigation, route }) {
  const { t, c } = useApp();
  const params = route.params || {};
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState(null);

  const handleContinue = () => {
    setError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setError(t.fillAllFields);
      return;
    }
    navigation.navigate("Language", {
      ...params,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
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
          <OnboardingHeader
            step={2}
            total={3}
            title={t.stepNamesTitle}
            subtitle={t.stepNamesSubtitle}
            c={c}
            onBack={() => navigation.goBack()}
          />

          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            <FormInput
              label={t.firstName}
              c={c}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="John"
            />
            <FormInput
              label={t.lastName}
              c={c}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Doe"
            />

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: c.dangerSoft }]}>
                <Text style={[styles.errorText, { color: c.danger }]}>{error}</Text>
              </View>
            ) : null}

            <PrimaryButton title={t.continue} onPress={handleContinue} c={c} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  errorBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, fontWeight: "500", lineHeight: 18 },
});
