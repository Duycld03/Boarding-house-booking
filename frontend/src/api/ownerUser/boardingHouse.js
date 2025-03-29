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
  return axios.get(`/owner/electrical-water-price/${boardingHouseId}`);
};
