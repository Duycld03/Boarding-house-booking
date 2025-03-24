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
export const getAllDepositRooms = (boardingHouseId) => {
  return axios.get(`owner/boardinghouse/deposit/${boardingHouseId}`);
};
export const acceptDepositRoom = (depositId) => {
  return axios.put(`owner/acceptdeposit/${depositId}`);
};

export const payDeposit = (data) => {
  return axios.post('auth/pay-deposit', data);
};
