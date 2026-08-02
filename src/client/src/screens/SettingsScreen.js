import React from "react";
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
import { Ionicons } from "@expo/vector-icons";
import LanguageSelector from "../components/LanguageSelector";

function Row({ label, value, icon, c, onPress, danger }) {
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? c.danger + "22" : c.accentSoft }]}>
        <Ionicons name={icon} size={17} color={danger ? c.danger : c.accentText} />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? c.danger : c.text }]}>
        {label}
      </Text>
      {value ? <Text style={[styles.rowValue, { color: c.textMuted }]}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={16} color={c.textFaint} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  const { user, t, c, setLanguage, signOut } = useApp();

  const confirmSignOut = () => {
    Alert.alert(t.signOut, t.signOutConfirm, [
      { text: t.cancel, style: "cancel" },
      { text: t.signOut, style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: c.text }]}>{t.settings}</Text>

      <Text style={[styles.sectionLabel, { color: c.textMuted }]}>{t.profile}</Text>
      <Row
        label={t.editProfile}
        icon="person-outline"
        value={`${user?.first_name || ""} ${user?.last_name || ""}`}
        c={c}
        onPress={() => navigation.navigate("EditProfile")}
      />

      <Text style={[styles.sectionLabel, { color: c.textMuted }]}>{t.language}</Text>
      <LanguageSelector
        lang={user?.language_pref || "en"}
        onSelect={setLanguage}
        c={c}
      />

      <Text style={[styles.sectionLabel, { color: c.textMuted }]}>{t.account}</Text>
      <Row
        label={t.changePassword}
        icon="key-outline"
        c={c}
        onPress={() => navigation.navigate("ChangePassword")}
      />
      <Row
        label={t.signOut}
        icon="log-out-outline"
        c={c}
        danger
        onPress={confirmSignOut}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingBottom: 40,
  },
  pageTitle: { fontSize: 24, fontWeight: "700", letterSpacing: -0.4, marginBottom: 24 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "600" },
  rowValue: { fontSize: 13 },
});
