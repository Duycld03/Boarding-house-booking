import axios from "./axios.config";

export const depositRoom = (data) => {
  return axios.post("auth/deposit", data);
};

export const getMyDepositedRoom = () => {
  return axios.get("auth/deposited-room");
};
