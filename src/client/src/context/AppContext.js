import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  initDB,
  getSessionUser,
  registerUser,
  signInUser,
  signOutUser,
  updateUserProfile,
  changeUserPassword,
  updateUserLanguage,
  saveScan,
} from "../db/database";
import { TRANSLATIONS } from "../constants/translations";
import { DARK, LIGHT } from "../constants/theme";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await initDB();
        const current = await getSessionUser();
        setUser(current);
      } catch (e) {
        console.error("[AppContext] init failed:", e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const register = useCallback(async (data) => {
    const u = await registerUser(data);
    setUser(u);
    return u;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const u = await signInUser(email, password);
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
  }, []);

  const updateUser = useCallback(
    async (fields) => {
      if (!user) return null;
      const u = await updateUserProfile(user.id, fields);
      setUser(u);
      return u;
    },
    [user],
  );

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!user) return;
      await changeUserPassword(user.id, currentPassword, newPassword);
    },
    [user],
  );

  const setLanguage = useCallback(
    async (lang) => {
      if (!user) return;
      const u = await updateUserLanguage(user.id, lang);
      setUser(u);
    },
    [user],
  );

  const addScan = useCallback(
    async (scan) => {
      if (!user) return;
      await saveScan(user.id, scan);
    },
    [user],
  );

  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);

  const lang = user?.language_pref || "en";

  const value = useMemo(() => {
    return {
      user,
      ready,
      isDark,
      lang,
      t: TRANSLATIONS[lang] || TRANSLATIONS.en,
      c: isDark ? DARK : LIGHT,
      register,
      signIn,
      signOut,
      updateUser,
      changePassword,
      setLanguage,
      addScan,
      toggleTheme,
    };
  }, [
    user,
    ready,
    isDark,
    lang,
    register,
    signIn,
    signOut,
    updateUser,
    changePassword,
    setLanguage,
    addScan,
    toggleTheme,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
