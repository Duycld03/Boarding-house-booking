import { createContext, useContext, useState, useMemo } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("admin");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const loginData = (userData, token) => {
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin", JSON.stringify(userData));
    setUser(userData);
  };

  const contextLogout = () => {
    localStorage.removeItem("admin");
    setUser(null);
  };

  const hasRole = (roles) => user && roles.includes(user.role);

  const isLogin = useMemo(() => {
    const localUser = localStorage.getItem("admin");
    if (!localUser) {
      localStorage.removeItem("admin_token");
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
