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
import Screen from "../components/Screen";
import SubHeader from "../components/SubHeader";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditProfileScreen({ navigation }) {
  const { user, t, c, updateUser, updateAvatar, removeAvatar } = useApp();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [error, setError] = useState(null);

  const initial = (firstName || user?.first_name || " ")[0]?.toUpperCase() || "?";

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
      Alert.alert(t.permissionRequired, t.permissionDenied);
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
    Alert.alert(t.removePhoto, t.removePhotoConfirm, [
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
    <Screen c={c}>
      <View style={styles.flex}>
        <View style={styles.headerWrap}>
          <SubHeader
            title={t.editProfile}
            c={c}
            onBack={() => navigation.goBack()}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.profileCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View>
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={[styles.avatar, { borderColor: c.border }]} />
              ) : (
                <View style={[styles.avatar, styles.avatarInitial, { backgroundColor: c.accentDeep }]}>
                  <Text style={styles.avatarInitialText}>{initial}</Text>
                </View>
              )}
              <TouchableOpacity
                style={[styles.cameraBtn, { backgroundColor: c.accentDeep, borderColor: c.surface }]}
                onPress={handleChangePhoto}
                disabled={avatarLoading}
                activeOpacity={0.7}
              >
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.profileName, { color: c.text }]}>
              {firstName} {lastName}
            </Text>
            <Text style={[styles.profileEmail, { color: c.textMuted }]}>{email}</Text>

            {user?.avatar_url ? (
              <TouchableOpacity
                style={[styles.removeBtn, { borderColor: c.danger }]}
                onPress={handleRemovePhoto}
                disabled={avatarLoading}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={15} color={c.danger} />
                <Text style={[styles.removeBtnText, { color: c.danger }]}>{t.removePhoto}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.removeBtn, { borderColor: c.border }]}
                onPress={handleChangePhoto}
                disabled={avatarLoading}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={15} color={c.accentText} />
                <Text style={[styles.removeBtnText, { color: c.accentText }]}>{t.changePhoto}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.formCard, { backgroundColor: c.surface, borderColor: c.border }]}>
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
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 24,
    borderWidth: 2,
  },
  avatarInitial: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitialText: { color: "#FFFFFF", fontSize: 34, fontWeight: "700" },
  cameraBtn: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: { fontSize: 18, fontWeight: "700", marginTop: 14 },
  profileEmail: { fontSize: 13, marginTop: 2, marginBottom: 14 },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
  },
  removeBtnText: { fontSize: 13, fontWeight: "600" },
  formCard: {
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
