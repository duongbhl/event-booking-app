import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMyProfile } from "../services/user.service";

interface User {
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
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /** Auto login */
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Load auth error", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  const login = async (userData: User, jwt: string) => {
    setUser(userData);
    setToken(jwt);
    await AsyncStorage.setItem("token", jwt);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    
    // Fetch full user profile immediately
    try {
      const fullProfile = await getMyProfile(jwt);
      setUser(fullProfile as User);
      await AsyncStorage.setItem("user", JSON.stringify(fullProfile));
    } catch (error) {
      console.log("Fetch full profile after login error:", error);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove(["token", "user"]);
  };

  const refreshUserProfile = async () => {
    try {
      if (!token) return;
      const updatedUser = await getMyProfile(token);
      setUser(updatedUser as User);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
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
