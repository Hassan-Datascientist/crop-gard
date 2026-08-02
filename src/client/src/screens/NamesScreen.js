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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.flex, { backgroundColor: c.bg }]}
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
          <Text style={[styles.error, { color: c.danger }]}>{error}</Text>
        ) : null}

        <PrimaryButton title={t.continue} onPress={handleContinue} c={c} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  error: { fontSize: 13, marginBottom: 14, textAlign: "center" },
});
