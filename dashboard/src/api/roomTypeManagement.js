import axios from "./axios.config";
export const getRoomTypeByBhId = (id) => {
  return axios.get(`/manager/boardinghouse/room-types/${id}`);
};

export const addRoomTypeToBoardingHouse = (boardingHouseId, data) => {
  return axios.post(
    `/manager/boardinghouse/roomtype/${boardingHouseId}/create`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const getAllFacilities = () => {
  return axios.get(`/manager/facilities`);
};
export const updateRoomTypeToBoardingHouse = (roomTypeId, data) => {
  return axios.put(`/manager/boardinghouse/roomtype/${roomTypeId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const softDeleteRoomType = (roomTypeId) => {
  return axios.delete(`/manager/boardinghouse/roomtype/${roomTypeId}`);
};
