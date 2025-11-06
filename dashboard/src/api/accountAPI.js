import axios from "./axios.config";
export const getAllAccount = (paginationOptions = {}) => {
  return axios.get("/dashboard/account", { params: paginationOptions });
};

export const deleteAccount = (accountId) => {
  return axios.delete(`/dashboard/account/${accountId}`);
};

export const filterAccount = (filterValue = {}, paginationOptions = {}) => {
  const params = {
    ...filterValue,
    ...paginationOptions,
  };

  return axios.get(`/dashboard/account/filter`, { params });
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

export const sendOTPChangeEmail = (data) => {
  return axios.post("auth/send-otp-change-email", data);
};

export const verifyChangeEmail = (data) => {
  return axios.post("auth/verify-change-email", data);
};

export const updateAvatar = (data) => {
  return axios.put("auth/avatar", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};