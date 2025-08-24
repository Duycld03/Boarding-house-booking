import { createContext, useContext, useState, useMemo } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const loginData = (userData, token) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const contextLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const hasRole = (roles) => user && roles.includes(user.role);

  const isLogin = useMemo(() => {
    const localUser = localStorage.getItem("user");
    if (!localUser) {
      localStorage.removeItem("access_token");
      return false;
    }
    return true;
  }, [user]);

  return (
    <UserContext.Provider
      value={{ user, isLogin, hasRole, loginData, contextLogout }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useCurrentUser = () => useContext(UserContext);
