import axios from "./axios.config";

export const getRenewalRequests = (params) => {
  return axios.get("/auth/renewal", { params });
}

export const createRenewalRequest = (data) => {
  return axios.post("/auth/renewal", data);
}

export const updateRenewalRequest = (requestId, data) => {
  return axios.put(`/auth/renewal/${requestId}`, data);
}
