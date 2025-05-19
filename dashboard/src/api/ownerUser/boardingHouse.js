import axios from "../axios.config";

export const getBoardingHouseDetail = (id) => {
  return axios.get(`/boardinghouse/${id}`);
};

export const getRoomTypeByBhId = (id, boardingHouseId) => {
  return axios.get(`/boardinghouse/room-types/${id}`, {
    params: { boardingHouseId },
  });
};

export const getReviewByBhId = (id) => {
  return axios.get(`/boardinghouse/reviews/${id}`);
};

export const getBhByArea = async (filterValue) => {
  return axios.get(`/boardinghouse/home/area`, {
    params: filterValue,
  });
};

export const getElectricalAndWaterPrice = (boardingHouseId) => {
  return axios.get(`/manager/electrical-water-price/${boardingHouseId}`);
};

export const addRoom = async (data) => {
  return axios.post(`/manager/room/boarding-house`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteRoom = async (id) => {
  return axios.delete(`/manager/room/boarding-house/${id}`);
};

export const updateRoom = async (roomId, data) => {
  return axios.put(`/manager/room/boarding-house/${roomId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
