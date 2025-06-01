import axios from "../axios.config";

export const getAvailableRooms = (boardingHouseId) => {
  return axios.get(`/manager/unpaid-rooms/${boardingHouseId}`);
};
