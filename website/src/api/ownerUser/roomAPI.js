import axios from "../axios.config";

export const getAvailableRooms = (boardingHouseId) => {
  return axios.get(`/staff/unpaid-rooms/${boardingHouseId}`);
};
