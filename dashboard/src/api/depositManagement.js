import axios from "./axios.config";

export const depositRoom = (data) => {
  return axios.post("auth/deposit", data);
};

export const getMyDepositedRoom = () => {
  return axios.get("auth/deposited-room");
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
  return axios.get(`manager/boardinghouse/deposit/${boardingHouseId}`, {
    params: filters,
  });
};
export const acceptDepositRoom = (depositId) => {
  return axios.put(`manager/acceptdeposit/${depositId}`);
};

export const getMaxDeposit = (boardingHouseId) => {
  return axios.get(
    `manager/boardinghouse/deposit/max-deposit/${boardingHouseId}`
  );
};

export const getRentTime = (boardingHouseId) => {
  return axios.get(
    `manager/boardinghouse/deposit/max-rent-time/${boardingHouseId}`
  );
};

export const payDeposit = (data) => {
  return axios.post("auth/pay-deposit", data);
};
export const rejectDepositRoom = (depositId, reasonForCancel) => {
  return axios.put(`manager/rejectdeposit/${depositId}`, { reasonForCancel });
};
