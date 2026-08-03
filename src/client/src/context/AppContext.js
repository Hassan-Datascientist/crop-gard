import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  initDB,
  getSessionUser,
  getUserById,
  registerUser,
  signInUser,
  signOutUser,
  setSession,
  setSyncState,
  getSyncState,
  updateUserProfile,
  changeUserPassword,
  updateUserLanguage,
  saveScan,
  getLocalScans,
  setScanImageKey,
  deleteScan,
  updateUserAvatar,
  upsertScansFromServer,
  upsertLocalUser,
} from "../db/database";
import * as api from "../services/api";
import { TRANSLATIONS } from "../constants/translations";
import { DARK, LIGHT } from "../constants/theme";

const AppContext = createContext(null);

function isAuthError(e) {
  const msg = e?.message || "";
  return (
    msg.includes("Not authenticated") ||
    msg.includes("Invalid or expired token") ||
    msg === "INVALID_CREDENTIALS"
  );
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [token, setToken] = useState(null);

  const tokenRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const syncNow = useCallback(async () => {
    const token = tokenRef.current;
    const user = userRef.current;
    if (!token || !user) return { ok: false };
    try {
      const state = await getSyncState();
      const localScans = await getLocalScans(user.id);
      const payload = [];
      for (const scan of localScans) {
        let imageKey = scan.image_key;
        let imageUrl = scan.image_url;
        if (scan.image_uri && !imageKey) {
          try {
            const up = await api.uploadImageApi(token, scan.image_uri);
            imageKey = up.image_id;
            imageUrl = up.url;
            await setScanImageKey(scan.uuid, up.image_id, up.url);
          } catch (e) {
            return { ok: false, error: e };
          }
        }
        payload.push({
          uuid: scan.uuid,
          disease: scan.disease,
          confidence: scan.confidence,
          unsupported: !!scan.unsupported,
          image_key: imageKey,
          image_uri: scan.image_uri,
          created_at: scan.created_at,
          updated_at: scan.updated_at || scan.created_at,
          deleted: !!scan.deleted_at,
        });
      }
      const res = await api.syncApi(token, {
        since: state?.last_sync_at || null,
        scans: payload,
      });
      await upsertScansFromServer(user.id, [...res.scans, ...res.conflicts]);
      await setSyncState({
        userId: user.id,
        token,
        lastSyncAt: res.server_time,
      });
      return { ok: true };
    } catch (e) {
      if (isAuthError(e)) {
        await signOutUser();
        setUser(null);
        setToken(null);
      }
      return { ok: false, error: e };
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await initDB();
        const current = await getSessionUser();
        const state = await getSyncState();
        setUser(current);
        setToken(state?.token || null);
      } catch (e) {
        console.error("[AppContext] init failed:", e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (ready && tokenRef.current && userRef.current) {
      syncNow();
    }
  }, [ready, syncNow]);

  const register = useCallback(
    async (data) => {
      try {
        const res = await api.registerApi(data);
        const localId = await upsertLocalUser({
          serverUser: res.user,
          password: data.password,
        });
        await setSession(localId);
        await setSyncState({ userId: localId, token: res.token });
        const u = await getUserById(localId);
        setUser(u);
        setToken(res.token);
        tokenRef.current = res.token;
        userRef.current = u;
        syncNow();
        return u;
      } catch (e) {
        if (e.message === "NETWORK_ERROR") {
          const u = await registerUser(data);
          setUser(u);
          return u;
        }
        throw e;
      }
    },
    [],
  );

  const signIn = useCallback(async (email, password) => {
    try {
      const res = await api.loginApi(email, password);
      const localId = await upsertLocalUser({
        serverUser: res.user,
        password,
      });
      await setSession(localId);
      await setSyncState({ userId: localId, token: res.token });
      const u = await getUserById(localId);
      setUser(u);
      setToken(res.token);
      tokenRef.current = res.token;
      userRef.current = u;
      syncNow();
      return u;
    } catch (e) {
      if (e.message === "NETWORK_ERROR") {
        const u = await signInUser(email, password);
        setUser(u);
        return u;
      }
      throw e;
    }
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback(
    async (fields) => {
      if (!user) return null;
      try {
        await api.updateMeApi(token, {
          first_name: fields.firstName,
          last_name: fields.lastName,
          email: fields.email,
        });
      } catch (e) {
        if (e.message !== "NETWORK_ERROR") throw e;
      }
      const u = await updateUserProfile(user.id, fields);
      setUser(u);
      return u;
    },
    [user, token],
  );

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!user) return;
      try {
        await api.changePasswordApi(token, currentPassword, newPassword);
      } catch (e) {
        if (e.message !== "NETWORK_ERROR") throw e;
        await changeUserPassword(user.id, currentPassword, newPassword);
      }
    },
    [user, token],
  );

  const setLanguage = useCallback(
    async (lang) => {
      if (!user) return;
      try {
        await api.updateMeApi(token, { language_pref: lang });
      } catch (e) {
        if (e.message !== "NETWORK_ERROR") throw e;
      }
      const u = await updateUserLanguage(user.id, lang);
      setUser(u);
    },
    [user, token],
  );

  const addScan = useCallback(
    async (scan) => {
      if (!user) return;
      await saveScan(user.id, scan);
      syncNow();
    },
    [user, syncNow],
  );

  const removeScan = useCallback(
    async (uuid) => {
      if (!user) return;
      await deleteScan(user.id, uuid);
      syncNow();
    },
    [user, syncNow],
  );

  const updateAvatar = useCallback(
    async (uri) => {
      if (!user) return null;
      const up = await api.uploadAvatarApi(token, uri);
      const u = await updateUserAvatar(user.id, up.avatar_key, up.avatar_url);
      setUser(u);
      return u;
    },
    [user, token],
  );

  const removeAvatar = useCallback(async () => {
    if (!user) return null;
    await api.removeAvatarApi(token);
    const u = await updateUserAvatar(user.id, null, null);
    setUser(u);
    return u;
  }, [user, token]);

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
      removeScan,
      updateAvatar,
      removeAvatar,
      syncNow,
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
    removeScan,
    updateAvatar,
    removeAvatar,
    syncNow,
    toggleTheme,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
