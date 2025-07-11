import axios from "./axios.config";

export const depositRoom = (data) => {
  return axios.post("auth/deposit", data);
};

export const getMyDepositedRoom = (paginationOptions = {}) => {
  const {
    page = 1,
    limit = 5,
    sortField = "createdAt",
    sortOrder = "desc",
  } = paginationOptions;

  return axios.get("auth/deposited-room", {
    params: {
      page,
      limit,
      sortField,
      sortOrder,
    },
  });
};

export const getDepositRoom = (depositRoomId) => {
  return axios.get(`auth/deposited-room/${depositRoomId}`);
};

export const payRent = (data) => {
  return axios.post("auth/pay-rent", data);
};

export const checkPayRentStatus = (depositRoomId) => {
  return axios.get(`auth/pay-rent/${depositRoomId}`);
};

export const getDepositByBhId = (boardingHouseId, filters = {}) => {
  return axios.get(`owner/boardinghouse/deposit/${boardingHouseId}`, {
    params: filters,
  });
};
export const acceptDepositRoom = (depositId) => {
  return axios.put(`owner/acceptdeposit/${depositId}`);
};

export const getMaxDeposit = (boardingHouseId) => {
  return axios.get(
    `owner/boardinghouse/deposit/max-deposit/${boardingHouseId}`
  );
};

export const getRentTime = (boardingHouseId) => {
  return axios.get(
    `owner/boardinghouse/deposit/max-rent-time/${boardingHouseId}`
  );
};

export const payDeposit = (data) => {
  return axios.post("auth/pay-deposit", data);
};
export const rejectDepositRoom = (depositId, reasonForCancel) => {
  return axios.put(`owner/rejectdeposit/${depositId}`, { reasonForCancel });
};
