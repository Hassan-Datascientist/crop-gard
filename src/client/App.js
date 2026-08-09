import React from "react";
import { View, Text, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, History, ScanLine, User, Leaf } from "lucide-react-native";
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

// ─── Main tab navigator ───────────────────────────────────────────────────────

function MainTabs() {
  const { t, c } = useApp();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          height: Platform.OS === "ios" ? 84 : 66,
          paddingBottom: Platform.OS === "ios" ? 22 : 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: c.tabActive,
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
            <Home size={size} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tab.Screen
        name="QuickAction"
        component={ScanScreen}
        options={{
          tabBarLabel: t.quickAction,
          tabBarIcon: ({ color, size }) => (
            <ScanLine size={size} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: t.historyTab,
          tabBarIcon: ({ color, size }) => (
            <History size={size} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t.profile,
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={2.2} />
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
      <View style={[styles.loadingTile, { backgroundColor: c.accentDeep }]}>
        <Leaf size={30} color="#FFFFFF" strokeWidth={2.2} />
      </View>
      <ActivityIndicator color={c.accent} style={styles.loadingSpinner} />
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
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingTile: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinner: { marginTop: 4 },
});
