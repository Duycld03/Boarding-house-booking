import axios from './axios.config';

export const getAllBHHome = (filterValue = {}, paginationOptions = {}) => {
  const params = {
    ...filterValue,
    ...paginationOptions,
  };

  return axios.get('/boardinghouse', { params });
};
export const getHighRatingBH = (filterValue = {}, paginationOptions = {}) => {
  const params = {
    ...filterValue,
    ...paginationOptions,
  };

  return axios.get('/boardinghouse/highrating', { params });
};

export const getNewestBH = (filterValue = {}, paginationOptions = {}) => {
  const params = {
    ...filterValue,
    ...paginationOptions,
  };

  return axios.get('/boardinghouse/newest', { params });
};
export const searchBoardingHouses = (
  filterValue = {},
  paginationOptions = {}
) => {
  const params = {
    ...filterValue,
    ...paginationOptions,
  };

  return axios.get('/boardinghouse/search', { params });
};
export const getAllBoardingHouseTypeUser = () => {
  return axios.get('/boardinghousetype');
};
export const getMaxPriceBHUser = async () => {
  return axios.get('/boardinghouse/chore/get-max');
};
export const getBhByArea = async (filterValue) => {
  return axios.get(`/boardinghouse/home/area`, {
    params: filterValue,
  });
};