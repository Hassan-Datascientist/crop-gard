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
import { useApp } from "../context/AppContext";
import {
  ChevronRight,
  Globe,
  KeyRound,
  LogOut,
  Moon,
  Palette,
  Sun,
  User,
} from "lucide-react-native";
import Screen from "../components/Screen";
import AppHeader from "../components/AppHeader";
import LanguageSheet from "../components/LanguageSheet";

function Row({ label, icon: Icon, avatarUri, c, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={[styles.avatar, { borderColor: c.border }]} />
      ) : (
        <View style={[styles.rowIcon, { backgroundColor: danger ? c.dangerSoft : c.accentSoft }]}>
          {Icon && <Icon size={18} color={danger ? c.danger : c.accentText} strokeWidth={2} />}
        </View>
      )}
      <Text style={[styles.rowLabel, { color: danger ? c.danger : c.text }]}>
        {label}
      </Text>
      <ChevronRight size={16} color={c.textFaint} strokeWidth={2.2} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  const { user, t, c, isDark, toggleTheme, setLanguage, signOut } = useApp();
  const [langOpen, setLangOpen] = useState(false);

  const confirmSignOut = () => {
    Alert.alert(t.signOut, t.signOutConfirm, [
      { text: t.cancel, style: "cancel" },
      { text: t.signOut, style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <Screen c={c}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          c={c}
          t={t}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenLanguage={() => setLangOpen(true)}
        />

        <Text style={[styles.pageTitle, { color: c.text }]}>{t.settings}</Text>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionIcon, { backgroundColor: c.accentSoft }]}>
              <Palette size={18} color={c.accentText} strokeWidth={2} />
            </View>
            <Text style={[styles.sectionTitle, { color: c.text }]}>{t.appearance}</Text>
          </View>
          <Row
            label={t.language}
            icon={Globe}
            c={c}
            onPress={() => setLangOpen(true)}
          />
          <TouchableOpacity style={styles.row} onPress={toggleTheme} activeOpacity={0.75}>
            <View style={[styles.rowIcon, { backgroundColor: c.accentSoft }]}>
              {isDark ? (
                <Moon size={18} color={c.accentText} strokeWidth={2} />
              ) : (
                <Sun size={18} color={c.accentText} strokeWidth={2} />
              )}
            </View>
            <Text style={[styles.rowLabel, { color: c.text }]}>{t.theme}</Text>
            <Text style={[styles.rowValue, { color: c.textMuted }]}>
              {isDark ? t.themeDark : t.themeLight}
            </Text>
            <ChevronRight size={16} color={c.textFaint} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionIcon, { backgroundColor: c.accentSoft }]}>
              <User size={18} color={c.accentText} strokeWidth={2} />
            </View>
            <Text style={[styles.sectionTitle, { color: c.text }]}>{t.account}</Text>
          </View>
          <Row
            label={t.editProfile}
            icon={User}
            avatarUri={user?.avatar_url}
            c={c}
            onPress={() => navigation.navigate("EditProfile")}
          />
          <Row
            label={t.changePassword}
            icon={KeyRound}
            c={c}
            onPress={() => navigation.navigate("ChangePassword")}
          />
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionIcon, { backgroundColor: c.dangerSoft }]}>
              <LogOut size={18} color={c.danger} strokeWidth={2} />
            </View>
            <Text style={[styles.sectionTitle, { color: c.text }]}>{t.session}</Text>
          </View>
          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: c.danger }]}
            onPress={confirmSignOut}
            activeOpacity={0.8}
          >
            <LogOut size={17} color={c.danger} strokeWidth={2} />
            <Text style={[styles.logoutText, { color: c.danger }]}>{t.signOut}</Text>
          </TouchableOpacity>
        </View>

        <LanguageSheet
          visible={langOpen}
          onClose={() => setLangOpen(false)}
          lang={user?.language_pref || "en"}
          onSelect={setLanguage}
          c={c}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingBottom: 40,
  },
  pageTitle: { fontSize: 26, fontWeight: "700", letterSpacing: -0.5, marginBottom: 18 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  rowValue: { fontSize: 13 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  logoutText: { fontSize: 14, fontWeight: "600" },
});
