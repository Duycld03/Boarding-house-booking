import axios from "./axios.config";

export const getExtensionRequests = () => {
  return axios.get("/auth/renewal");
}

export const createExtensionRequest = (data) => {
  return axios.post("/auth/renewal", data);
}

export const updateExtensionRequest = (requestId, data) => {
  return axios.put(`/auth/renewal/${requestId}`, data);
}
