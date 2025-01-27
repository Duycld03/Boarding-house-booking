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
