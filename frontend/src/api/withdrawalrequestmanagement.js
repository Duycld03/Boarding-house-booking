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