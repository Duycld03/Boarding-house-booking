import axios from './axios.config';
export const filterBHUser = async (filterValue) => {
  return axios.get(`/boardinghouse/filter`, {
    params: filterValue,
  });
};
export const getAllBoardingHDB = () => {
  return axios.get('/dashboard/boardinghouse');
};
export const getAllBHHome = () => {
  return axios.get('/boardinghouse');
};
export const getBoardingHouseDetails = async (boardingHouseId) => {
  return axios.get(`/dashboard/boardinghouse/${boardingHouseId}`);
};
export const updateBoardingHouseDetails = (boardingHouseId, updateData) => {
  return axios.put(`/dashboard/boardinghouse/${boardingHouseId}`, updateData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const filterBoardingHouseTypes = (filterParams) => {
  return axios.get('/dashboard/boardinghousetype/filter', {
    params: filterParams,
  });
};
export const getAllBoardingHouseTypes = () => {
  return axios.get('/dashboard/types');
};
export const addBoardingHouseImage = (boardingHouseId, imageData) => {
  return axios.post(
    `/dashboard/boardinghouse/${boardingHouseId}/images`,
    imageData
  );
};

export const updateBoardingHouseImage = (
  boardingHouseId,
  imageId,
  imageData
) => {
  return axios.put(
    `/dashboard/boardinghouse/${boardingHouseId}/images/${imageId}`,
    imageData
  );
};

export const deleteBoardingHouseImage = (boardingHouseId, imageId) => {
  return axios.delete(
    `/dashboard/boardinghouse/${boardingHouseId}/images/${imageId}`
  );
};
export const getBoardingHouseImages = async (boardingHouseId) => {
  return axios.get(`/dashboard/boardinghouse/${boardingHouseId}/images`);
};
export const createBoardingHouse = (data) => {
  return axios.post('/dashboard/boardinghouse/create', data);
};
export const uploadFile = (data) => {
  return axios.post('/dashboard/boardinghouse/uploadFile', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getMaxPriceBH = async () => {
  return axios.get('/dashboard/boardinghouse/chore/get-max');
};

export const filterBH = async (filterValue) => {
  return axios.get(`/dashboard/boardinghouse/chore/filter`, {
    params: filterValue,
  });
};
export const softDeleteBoardingHouse = async (boardingHouseId) => {
  return axios.delete(`/dashboard/boardinghouse/${boardingHouseId}/softDelete`);
};
export const getAllBHOwner = (filterValue, paginationOptions) => {
  return axios.get('/manager/boardinghouseowner', {
    params: {
      ...filterValue,
      ...paginationOptions,
    },
  });
};

export const getAllBoardingHouseTypesOwner = () => {
  return axios.get('/manager/types');
};
export const createBoardingHouseOwner = (data) => {
  return axios.post('owner/boardinghouse', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const softDeleteBoardingHouseOwner = async (boardingHouseId) => {
  return axios.delete(`/owner/boardinghouse/${boardingHouseId}/softDelete`);
};
export const updateBoardingHouseDetailsOwner = (
  boardingHouseId,
  updateData
) => {
  return axios.put(`/manager/boardinghouse/${boardingHouseId}`, updateData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const getAllBoardingHouseTypeUser = () => {
  return axios.get('/boardinghousetype');
};
export const getMaxPriceBHUser = async () => {
  return axios.get('/boardinghouse/chore/get-max');
};
export const createBoardingHouseType = (data) => {
  return axios.post('/dashboard/boardinghousetype/create', data);
};
export const getBoardingHouseTypeDetails = (boardingHouseTypeId) => {
  return axios.get(`/dashboard/boardinghousetype/${boardingHouseTypeId}`);
};
export const updateBoardingHouseType = (boardingHouseTypeId, updateData) => {
  return axios.put(
    `/dashboard/boardinghousetype/${boardingHouseTypeId}`,
    updateData
  );
};
export const softDeleteBoardingHouseType = (boardingHouseTypeId) => {
  return axios.delete(`/dashboard/boardinghousetype/${boardingHouseTypeId}`);
};
export const getManagersForOwner = () => {
  return axios.get(`/manager/manager-owner`);
};
