import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const loginData = (userData, token) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const hasRole = (roles) => {
    return user ? roles.includes(user.role) : false;
  };

  const isLogin = !!user;

  return (
    <UserContext.Provider value={{ isLogin, hasRole, loginData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useCurrentUser = () => useContext(UserContext);
