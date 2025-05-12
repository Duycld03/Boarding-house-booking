import axios from "./axios.config";

export const login = (data) => {
  return axios.post("/login", data);
};

export const loginWithGoogle = (data) => {
  return axios.post("/login-with-google", data);
};

export const register = (data) => {
  return axios.post("/register", data);
};

export const sendOTPRegister = (data) => {
  return axios.post("/send-otp-register", data);
};

export const verifyRegister = (data) => {
  return axios.post("/verify-register", data);
};

export const getUser = () => {
  return axios.get("auth/user");
};

export const forgotPassword = (data) => {
  return axios.post("/forgot-password", data);
};

export const resetPassword = (data) => {
  return axios.post("/reset-password", data);
};

export const changePassword = (data) => {
  return axios.post("auth/change-password", data);
};
