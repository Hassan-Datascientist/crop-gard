import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useApp } from "../context/AppContext";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditProfileScreen({ navigation }) {
  const { user, t, c, updateUser } = useApp();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError(t.fillAllFields);
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError(t.invalidEmail);
      return;
    }
    setLoading(true);
    try {
      await updateUser({ firstName, lastName, email });
      Alert.alert(t.profileUpdated, t.saved, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      setError(e.message === "EMAIL_IN_USE" ? t.emailInUse : e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={[styles.back, { color: c.textMuted }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: c.text }]}>{t.editProfile}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormInput
          label={t.firstName}
          c={c}
          value={firstName}
          onChangeText={setFirstName}
          placeholder={t.firstName}
          autoCapitalize="words"
        />
        <FormInput
          label={t.lastName}
          c={c}
          value={lastName}
          onChangeText={setLastName}
          placeholder={t.lastName}
          autoCapitalize="words"
        />
        <FormInput
          label={t.email}
          c={c}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {error ? (
          <Text style={[styles.error, { color: c.danger }]}>{error}</Text>
        ) : null}

        <PrimaryButton title={t.save} onPress={handleSave} loading={loading} c={c} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  back: { fontSize: 34, lineHeight: 34, fontWeight: "600" },
  pageTitle: { fontSize: 18, fontWeight: "700" },
  scroll: { padding: 20 },
  error: { fontSize: 13, marginBottom: 14, textAlign: "center" },
});
