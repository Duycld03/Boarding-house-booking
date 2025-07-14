import axios from "./axios.config";

export const checkRefundRequestExists = (depositRoomId) => {
  return axios.get(`/auth/refund-request/check-exists/${depositRoomId}`);
};

export const getMyRefundRequests = () => {
  return axios.get("/auth/refund-request/my-requests");
};

export const createRefundRequest = (data) => {
  return axios.post("/auth/refund-requests", data);
};
