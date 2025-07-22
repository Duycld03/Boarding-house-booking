import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { getOwnerDataForDashboard } from "@/api/accountAPI";
import userRole from "@/constants/userRole";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [ownerResources, setOwnerResources] = useState(null);

  const fetchOwnerResources = async () => {
    try {
      const response = await getOwnerDataForDashboard();

      if (response.success) {
        const data = await response;
        setOwnerResources(data.total);

        const updatedUser = {
          ...user,
          resources: data.total,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Failed to fetch owner resources:", error);
    }
  };

  const loginData = async (userData, token) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // Nếu user là owner, lấy thông tin tài nguyên
    if (userData.role === "owner") {
      await fetchOwnerResources();
    }
  };

  const updateOwnerResources = async () => {
    if (user?.role === userRole?.owner) {
      const token = localStorage.getItem("access_token");
      if (token) {
        await fetchOwnerResources();
      }
    }
  };

  const contextLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    setUser(null);
    setOwnerResources(null);
  };

  const hasRole = (roles) => user && roles.includes(user.role);

  const isLogin = useMemo(() => !!user, [user]);

  // Khi component mount và user là owner, lấy thông tin tài nguyên
  useEffect(() => {
    if (user?.role === "owner" && !user?.resources) {
      const token = localStorage.getItem("access_token");
      if (token) {
        fetchOwnerResources(token);
      }
    }
  }, [user?.role]);

  return (
    <UserContext.Provider
      value={{
        user,
        isLogin,
        hasRole,
        loginData,
        contextLogout,
        ownerResources, // Cung cấp trực tiếp thông tin tài nguyên
        updateOwnerResources, // Hàm để cập nhật lại thông tin tài nguyên khi cần
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useCurrentUser = () => useContext(UserContext);
