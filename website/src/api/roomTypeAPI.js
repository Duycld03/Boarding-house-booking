import axios from './axios.config';
export const getRoomTypeByBhId = (id, paginationOptions = {}) => {
  const params = {
    ...paginationOptions,
  };

  return axios.get(`/staff/boardinghouse/room-types/${id}`, { params });
};

export const addRoomTypeToBoardingHouse = (boardingHouseId, data) => {
  return axios.post(
    `/staff/boardinghouse/roomtype/${boardingHouseId}/create`,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

export const getAllFacilities = () => {
  return axios.get(`/staff/facilities`);
};
export const updateRoomTypeToBoardingHouse = (roomTypeId, data) => {
  return axios.put(`/staff/boardinghouse/roomtype/${roomTypeId}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const softDeleteRoomType = (roomTypeId) => {
  return axios.delete(`/staff/boardinghouse/roomtype/${roomTypeId}`);
};
