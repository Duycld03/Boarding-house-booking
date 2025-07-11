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
};
