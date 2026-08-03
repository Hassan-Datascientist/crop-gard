import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import { AppProvider, useApp } from "./src/context/AppContext";

import WelcomeScreen from "./src/screens/WelcomeScreen";
import EmailPasswordScreen from "./src/screens/EmailPasswordScreen";
import NamesScreen from "./src/screens/NamesScreen";
import LanguagePreferenceScreen from "./src/screens/LanguagePreferenceScreen";
import SignInScreen from "./src/screens/SignInScreen";
import HomeScreen from "./src/screens/HomeScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ScanScreen from "./src/screens/ScanScreen";
import ScanDetailScreen from "./src/screens/ScanDetailScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import ChangePasswordScreen from "./src/screens/ChangePasswordScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Center "Quick Action" tab button (prominent, floating) ──────────────────

function ScanTabButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={styles.scanTabWrap}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
    >
      <View style={[styles.scanTabBtn, { backgroundColor: "#3FB950" }]}>
        <Ionicons name="scan-outline" size={26} color="#FFFFFF" />
      </View>
      {children}
    </TouchableOpacity>
  );
}

// ─── Main tab navigator ───────────────────────────────────────────────────────

function MainTabs() {
  const { t, c, isDark } = useApp();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
        },
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t.homeTab,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: t.historyTab,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="QuickAction"
        component={ScanScreen}
        options={{
          tabBarLabel: t.quickAction,
          tabBarButton: (props) => <ScanTabButton {...props} />,
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t.settingsTab,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Main stack (tabs + pushed sub-screens) ───────────────────────────────────

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="ScanDetail" component={ScanDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}

// ─── Auth stack ───────────────────────────────────────────────────────────────

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="EmailPassword" component={EmailPasswordScreen} />
      <Stack.Screen name="Names" component={NamesScreen} />
      <Stack.Screen name="Language" component={LanguagePreferenceScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
    </Stack.Navigator>
  );
}

function LoadingScreen() {
  const { c } = useApp();
  return (
    <View style={[styles.loading, { backgroundColor: c.bg }]}>
      <Ionicons name="leaf" size={44} color={c.accent} />
      <Text style={[styles.loadingText, { color: c.textMuted }]}>…</Text>
    </View>
  );
}

// ─── Root: swap stacks based on session ───────────────────────────────────────

function RootNavigator() {
  const { user, ready, isDark } = useApp();
  if (!ready) return <LoadingScreen />;
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      {user ? <MainStack /> : <AuthStack />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  scanTabWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanTabBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Platform.OS === "ios" ? -8 : -16,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: { fontSize: 13 },
});
