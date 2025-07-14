import axios from './axios.config';

export const getRefundRequests = (paginationOptions = {}) => {
  const {
    page = 1,
    limit = 5,
    sortField = 'createdAt',
    sortOrder = 'desc',
  } = paginationOptions;

  return axios.get('auth/refund-requests', {
    params: {
      page,
      limit,
      sortField,
      sortOrder,
    },
  });
};
export const createRefundRequest = (data) => {
  return axios.post('auth/refund-requests', data);


export const checkRefundRequestExists = (depositRoomId) => {
  return axios.get(`/auth/refund-request/check-exists/${depositRoomId}`);
};

export const getMyRefundRequests = () => {
  return axios.get("/auth/refund-request/my-requests");
};


