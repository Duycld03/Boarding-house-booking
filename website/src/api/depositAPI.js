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

// export const getDepositsByOwnerOrStaff = (filters = {}) => {
//   return axios.get('staff/bh/deposit-list', {
//     params: filters,
//   });
// };
export const getDepositsByOwnerOrStaff = (
  filterValue = {},
  paginationOptions = {}
) => {
  const params = {
    ...filterValue,
    ...paginationOptions,
  };

  return axios.get(`staff/bh/deposit-list`, { params });
};

export const handleDepositDecision = (
  depositId,
  action,
  reasonForCancel = ''
) => {
  const payload = { action };
  if (action === 'reject') {
    payload.reasonForCancel = reasonForCancel;
  }
  return axios.put(`/staff/deposit/${depositId}`, payload);
};

export const getMaxDeposit = (boardingHouseId) => {
  return axios.get(
    `staff/boardinghouse/deposit/max-deposit/${boardingHouseId}`
  );
};

export const getRentTime = (boardingHouseId) => {
  return axios.get(
    `staff/boardinghouse/deposit/max-rent-time/${boardingHouseId}`
  );
};

export const payDeposit = (data) => {
  return axios.post('auth/pay-deposit', data);
};
export const rejectDepositRoom = (depositId, reasonForCancel) => {
  return axios.put(`staff/rejectdeposit/${depositId}`, { reasonForCancel });
};
