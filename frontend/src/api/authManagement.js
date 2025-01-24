import axios from "./axios.config";

export const login = (data) => {
  return axios.post("/login", data);
};
