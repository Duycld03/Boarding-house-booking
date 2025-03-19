import axios from './axios.config';

export const depositRoom = (data) => {
  return axios.post('auth/deposit', data);
};

export const getMyDepositedRoom = () => {
  return axios.get('auth/deposited-room');
};

export const getDepositRoom = (depositRoomId) => {
  return axios.get(`auth/deposited-room/${depositRoomId}`);
};

export const payRent = (data) => {
  return axios.post('auth/pay-rent', data);
};

export const checkPayRentStatus = (depositRoomId) => {
  return axios.get(`auth/pay-rent/${depositRoomId}`);
};

export const getDepositByBhId = (boardingHouseId, filters = {}) => {
  return axios.get(`owner/boardinghouse/deposit/${boardingHouseId}`, { params: filters });
};

export const getMaxDeposit = (boardingHouseId) => {
  return axios.get(`owner/boardinghouse/deposit/max-deposit/${boardingHouseId}`);
};

export const getRentTime = (boardingHouseId) => {
  return axios.get(`owner/boardinghouse/deposit/max-rent-time/${boardingHouseId}`);
}
