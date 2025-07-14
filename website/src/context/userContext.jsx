import { createContext, useContext, useState, useMemo } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      return null;
    }
  });

  const loginData = (userData, token) => {
    try {
      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  const contextLogout = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const hasRole = (roles) => {
    return user && Array.isArray(roles) && roles.includes(user.role);
  };

  const isLogin = useMemo(() => !!user, [user]);

  const contextValue = useMemo(
    () => ({
      user,
      isLogin,
      hasRole,
      loginData,
      contextLogout,
    }),
    [user, isLogin]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within a UserProvider");
  }
  return context;
};
