import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMyProfile } from "../services/user.service";
import { initializePushNotifications } from "../services/notification.service";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  country?: string;
  interests?: string[];
  location?: string;
  description?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (user: User, token: string, remember?: boolean) => Promise<User>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "user";
const REMEMBER_ME_STORAGE_KEY = "remember-me";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /** Auto login */
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const [storedToken, storedUser, shouldRemember] = await AsyncStorage.multiGet([
          TOKEN_STORAGE_KEY,
          USER_STORAGE_KEY,
          REMEMBER_ME_STORAGE_KEY,
        ]).then((entries) => entries.map((entry) => entry[1]));

        if (shouldRemember === "true" && storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          try {
            await initializePushNotifications(storedToken);
          } catch (error) {
            console.log("Initialize push notifications on restore error", error);
          }
        }
      } catch (error) {
        console.log("Load auth error", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  const login = async (
    userData: User,
    jwt: string,
    remember = false
  ): Promise<User> => {
    setUser(userData);
    setToken(jwt);

    if (remember) {
      await AsyncStorage.multiSet([
        [TOKEN_STORAGE_KEY, jwt],
        [USER_STORAGE_KEY, JSON.stringify(userData)],
        [REMEMBER_ME_STORAGE_KEY, "true"],
      ]);
    } else {
      await AsyncStorage.multiRemove([
        TOKEN_STORAGE_KEY,
        USER_STORAGE_KEY,
        REMEMBER_ME_STORAGE_KEY,
      ]);
    }
    
    // Initialize push notifications after login
    try {
      await initializePushNotifications(jwt);
    } catch (error) {
      console.log("Initialize push notifications error:", error);
    }
    
    // Fetch full user profile immediately
    try {
      const fullProfile = await getMyProfile(jwt);
      setUser(fullProfile as User);
      if (remember) {
        await AsyncStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(fullProfile)
        );
      }
      return fullProfile as User;
    } catch (error) {
      console.log("Fetch full profile after login error:", error);
      return userData;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove([
      TOKEN_STORAGE_KEY,
      USER_STORAGE_KEY,
      REMEMBER_ME_STORAGE_KEY,
    ]);
  };

  const refreshUserProfile = async () => {
    try {
      if (!token) return;
      const updatedUser = await getMyProfile(token);
      setUser(updatedUser as User);

      const shouldRemember = await AsyncStorage.getItem(REMEMBER_ME_STORAGE_KEY);
      if (shouldRemember === "true") {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.log("Refresh user profile error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, refreshUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
