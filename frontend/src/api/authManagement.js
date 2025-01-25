import axios from "./axios.config";

export const login = (data) => {
  return axios.post("/login", data);
};

export const register = (data) => {
  return axios.post("/register", data);
};

export const getUser = () => {
  return axios.get("auth/user");
};
