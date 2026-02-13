import React, { useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../../features/auth/api/auth.api.js";
import { clearAuthStorage, getToken, setToken, setUser as persistUser, getUser, clearUser } from "../../services/storage.js";
import { getAdminRoleFromUser } from "../../utils/constants.js";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [token, setTokenState] = useState(getToken());
  const [user, setUserState] = useState(getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getToken()));

  const updateUserState = useCallback((rawUser) => {
    const normalized = rawUser?.user || rawUser || null;
    if (normalized) {
      persistUser(normalized);
    } else {
      clearUser();
    }
    setUserState(normalized);
    return normalized;
  }, []);

  useEffect(() => {
    async function bootstrap() {
      const t = getToken();
      if (!t) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        updateUserState(me);
        setIsAuthenticated(true);
      } catch {
        clearAuthStorage();
        setTokenState(null);
        setUserState(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [updateUserState]);

  const login = useCallback(async ({ email_or_phone, password, device_name }) => {
    const identifier = String(email_or_phone || "").trim();
    const res = await authApi.login({
      email: identifier,
      email_or_phone: identifier,
      password,
      device_name
    });
    const t = res?.token || res?.access_token;
    if (!t) throw new Error("No token returned from server.");

    setToken(t);
    setTokenState(t);

    // Fetch me
    const me = await authApi.me();
    updateUserState(me);
    setIsAuthenticated(true);

    return me?.user || me;
  }, [updateUserState]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      clearAuthStorage();
      setTokenState(null);
      setUserState(null);
      setIsAuthenticated(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await authApi.getProfile();
    return updateUserState(profile);
  }, [updateUserState]);

  const adminRole = useMemo(() => getAdminRoleFromUser(user), [user]);

  const value = useMemo(
    () => ({
      loading,
      token,
      user,
      adminRole,
      isAuthenticated,
      login,
      logout,
      refreshProfile,
      updateUser: updateUserState
    }),
    [loading, token, user, adminRole, isAuthenticated, login, logout, refreshProfile, updateUserState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
