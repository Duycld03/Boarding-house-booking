import axios from "./axios.config";
export const getAllAccount = () => {
  return axios.get("/dashboard/account");
};

export const deleteAccount = (accountId) => {
  return axios.delete(`/dashboard/account/${accountId}`);
};

export const filterAccount = (filterValue) => {
  return axios.get(`/dashboard/account/filter`, {
    params: filterValue,
  });
};

export const createAccount = (accountData) => {
  return axios.post(`/dashboard/account/create`, accountData);
};

export const updateAccount = (accountId, accountData) => {
  return axios.put(`/dashboard/account/${accountId}`, accountData);
};

export const changePassword = (data) => {
  return axios.post("auth/change-password", data);
};

export const updateAccountFromProfile = (data) => {
  return axios.put("auth/profile", data);
};

export const updateEmail = (data) => {
  return axios.put("auth/email", data);
};

export const updateAvatar = (data) => {
  return axios.put("auth/avatar", data);
};
