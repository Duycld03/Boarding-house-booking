import { createContext, useContext, useState, useMemo, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from AsyncStorage on app start
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  const loginData = async (userData, token) => {
    try {
      await AsyncStorage.setItem("access_token", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error saving user data:", error);
      throw error;
    }
  };

  const contextLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["user", "access_token"]);
      setUser(null);
    } catch (error) {
      console.error("Error removing user data:", error);
      throw error;
    }
  };

  const hasRole = (roles) => user && roles.includes(user.role);

  const isLogin = useMemo(() => !!user, [user]);

  // Helper function to get access token
  const getAccessToken = async () => {
    try {
      return await AsyncStorage.getItem("access_token");
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLogin,
        isLoading,
        hasRole,
        loginData,
        contextLogout,
        getAccessToken
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useCurrentUser must be used within a UserProvider');
  }
  return context;
};