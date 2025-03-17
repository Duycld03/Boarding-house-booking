import axios from './axios.config';
export const getRoomTypeByBhId = (id) => {
  return axios.get(`/owner/boardinghouse/room-types/${id}`);
};

export const addRoomTypeToBoardingHouse = (boardingHouseId, data) => {
  return axios.post(
    `/owner/boardinghouse/roomtype/${boardingHouseId}/create`,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

export const getAllFacilities = () => {
  return axios.get(`/owner/facilities`);
};
export const updateRoomTypeToBoardingHouse = (roomTypeId, data) => {
  return axios.put(`/owner/boardinghouse/roomtype/${roomTypeId}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
