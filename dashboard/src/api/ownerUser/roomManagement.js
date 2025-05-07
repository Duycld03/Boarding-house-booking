import axios from "../axios.config";

export const getAvailableRooms = (boardingHouseId) => {
  return axios.get(`/owner/unpaid-rooms/${boardingHouseId}`);
};
