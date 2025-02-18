import axios from "./axios.config";

export const getWithdrawRequests = () => {
  return axios.get("/dashboard/withdrawRequests");
};

export const getAllWithdrawalRequestStatus = () => {
  return axios.get("/dashboard/withdrawRequests/status");
};

export const getMaxAmountWithdrawRequest = () => {
  return axios.get("/dashboard/withdrawRequests/maxAmount");
};

export const filterWithdrawRequests = (data) => {
  return axios.post("/dashboard/withdrawRequests/filter", data);
};
