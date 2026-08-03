import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditProfileScreen({ navigation }) {
  const { user, t, c, updateUser, updateAvatar, removeAvatar } = useApp();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
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

  const pickAvatar = async (useCamera = false) => {
    const permResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permResult.status !== "granted") {
      Alert.alert(t.settings, t.networkError);
      return;
    }
    const options = { allowsEditing: true, aspect: [1, 1], quality: 0.92 };
    const picked = useCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    if (picked.canceled) return;
    setAvatarLoading(true);
    try {
      await updateAvatar(picked.assets[0].uri);
    } catch (e) {
      Alert.alert(t.profileUpdated, e.message === "NETWORK_ERROR" ? t.networkError : e.message);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert(t.changePhoto, "", [
      { text: t.cancel, style: "cancel" },
      { text: t.uploadFromGallery, onPress: () => pickAvatar(false) },
      { text: t.takePhoto, onPress: () => pickAvatar(true) },
    ]);
  };

  const handleRemovePhoto = () => {
    Alert.alert(t.removePhoto, t.deleteScanConfirm, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.removePhoto,
        style: "destructive",
        onPress: async () => {
          setAvatarLoading(true);
          try {
            await removeAvatar();
          } catch (e) {
            Alert.alert(t.profileUpdated, e.message === "NETWORK_ERROR" ? t.networkError : e.message);
          } finally {
            setAvatarLoading(false);
          }
        },
      },
    ]);
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
        <View style={styles.avatarRow}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={[styles.avatar, { borderColor: c.border }]} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
              <Ionicons name="person" size={44} color={c.textMuted} />
            </View>
          )}
          <View style={styles.avatarActions}>
            <TouchableOpacity
              style={[styles.avatarButton, { borderColor: c.border }]}
              onPress={handleChangePhoto}
              disabled={avatarLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={16} color={c.accent} />
              <Text style={[styles.avatarButtonText, { color: c.accent }]}>{t.changePhoto}</Text>
            </TouchableOpacity>
            {user?.avatar_url ? (
              <TouchableOpacity
                style={[styles.avatarButton, { borderColor: c.border }]}
                onPress={handleRemovePhoto}
                disabled={avatarLoading}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color={c.danger} />
                <Text style={[styles.avatarButtonText, { color: c.danger }]}>{t.removePhoto}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

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
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarActions: {
    flex: 1,
    marginLeft: 18,
    gap: 10,
  },
  avatarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
  },
  avatarButtonText: { fontSize: 14, fontWeight: "600" },
});
