import axios from "../axios.config";

export const getBoardingHouseDetail = (id) => {
  return axios.get(`/boardinghouse/${id}`);
};

export const getRoomTypeByBhId = (id, boardingHouseId) => {
  return axios.get(`/boardinghouse/room-types/${id}`, {
    params: { boardingHouseId },
  });
};


export const getReviewByBhId = (id, paginationOptions = {}) => {
  const params = {
    ...paginationOptions,
  };
  return axios.get(`/boardinghouse/reviews/${id}`, { params });
};

export const getBhByArea = async (filterValue) => {
  return axios.get(`/boardinghouse/home/area`, {
    params: filterValue,
  });
};

export const getElectricalAndWaterPrice = (boardingHouseId) => {
  return axios.get(`/owner/electrical-water-price/${boardingHouseId}`);
}

export const addRoom = async (data) => {
  return axios.post(`/owner/room/boarding-house`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteRoom = async (id) => {
  return axios.delete(`/owner/room/boarding-house/${id}`);
};

export const updateRoom = async (roomId, data) => {
  return axios.put(`/owner/room/boarding-house/${roomId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
