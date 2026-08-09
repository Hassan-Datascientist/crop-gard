import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useApp } from "../context/AppContext";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import Screen from "../components/Screen";
import SubHeader from "../components/SubHeader";

export default function ChangePasswordScreen({ navigation }) {
  const { t, c, changePassword } = useApp();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setError(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t.fillAllFields);
      return;
    }
    if (newPassword.length < 6) {
      setError(t.passwordTooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert(t.passwordUpdated, t.saved, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      setError(e.message === "WRONG_PASSWORD" ? t.wrongPassword : e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen c={c}>
      <View style={styles.flex}>
        <View style={styles.headerWrap}>
          <SubHeader
            title={t.changePassword}
            c={c}
            onBack={() => navigation.goBack()}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            <FormInput
              label={t.currentPassword}
              c={c}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="••••••••"
              secureTextEntry
            />
            <FormInput
              label={t.newPassword}
              c={c}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••"
              secureTextEntry
            />
            <FormInput
              label={t.confirmNewPassword}
              c={c}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: c.dangerSoft }]}>
                <Text style={[styles.errorText, { color: c.danger }]}>{error}</Text>
              </View>
            ) : null}

            <PrimaryButton title={t.save} onPress={handleSave} loading={loading} c={c} />
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerWrap: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingBottom: 12,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  errorBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, fontWeight: "500", lineHeight: 18 },
});
