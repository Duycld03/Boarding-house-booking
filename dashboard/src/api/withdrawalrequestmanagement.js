import axios from "./axios.config";

export const getWithdrawRequests = () => {
  return axios.get("/dashboard/withdrawRequests");
};

export const getWithdrawRequestDetail = (id) => {
  return axios.get(`/dashboard/withdrawRequests/${id}`);
};

export const updateWithdrawStatus = async (id, payload) => {
  return axios.put(`/dashboard/withdrawRequests/${id}`, payload);
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
