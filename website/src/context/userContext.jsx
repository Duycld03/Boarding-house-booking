import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { getOwnerDataForDashboard } from "@/api/accountAPI";
import { getUser } from "@/api/authAPI";
import userRole from "@/constants/userRole";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ownerResources, setOwnerResources] = useState(null);

  const fetchOwnerResources = async () => {
    try {
      const response = await getOwnerDataForDashboard();

      if (response.success) {
        const data = await response;
        setOwnerResources(data.total);

        // Cập nhật thông tin resources trong user state
        setUser((prevUser) => ({
          ...prevUser,
          resources: data.total,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch owner resources:", error);
    }
  };

  // Lấy thông tin người dùng từ API
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      if (token) {
        const userData = await getUser();
        console.log("User data from API:", userData); // Thêm log để debug

        // Kiểm tra nếu user role không phải staff hoặc owner thì xóa token
        if (
          userData &&
          userData.role !== "staff" &&
          userData.role !== "owner"
        ) {
          console.log("Invalid role detected:", userData.role); // Thêm log để debug
          localStorage.removeItem("access_token");
          setUser(null);
          setLoading(false);
          return false;
        }

        setUser(userData);

        // Nếu là owner, lấy thêm thông tin tài nguyên
        if (userData && userData.role === "owner") {
          await fetchOwnerResources();
        }

        return true; // Trả về true khi mọi thứ OK
      }
      return false;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      contextLogout(); // Logout nếu token không hợp lệ
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Chỉ lưu token khi đăng nhập, không lưu thông tin user
  const loginData = async (userData, token) => {
    localStorage.setItem("access_token", token);

    // Lấy thông tin user từ API
    await fetchUserData();

    // Trả về thông tin user hiện tại để kiểm tra role
    return user;
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
    localStorage.removeItem("access_token");
    setUser(null);
    setOwnerResources(null);
  };

  const hasRole = (roles) => user && roles.includes(user.role);

  const isLogin = useMemo(() => !!user, [user]);

  // Kiểm tra token và lấy thông tin người dùng khi component được mount
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isLogin,
        hasRole,
        loginData,
        contextLogout,
        ownerResources,
        updateOwnerResources,
        loading,
        refetchUser: fetchUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useCurrentUser = () => useContext(UserContext);
