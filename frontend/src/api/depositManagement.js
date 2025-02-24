import axios from "./axios.config";

export const depositRoom = (data) => {
  return axios.post("auth/deposit", data);
};
