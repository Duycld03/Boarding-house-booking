import axios from './axios.config';
export const getRenewalRequestByBhID = (boardingHouseId) => {
  return axios.get(`owner/renewal/boarding-house/${boardingHouseId}`);
};
