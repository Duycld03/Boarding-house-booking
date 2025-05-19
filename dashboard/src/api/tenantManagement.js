import axios from "./axios.config";
export const getTenantsByBoardingHouse = (boardingHouseId) => {
  return axios.get(`manager/tenant/${boardingHouseId}`);
};
export const deleteTenantFromBoardingHouse = (boardingHouseId, accountId) => {
  return axios.delete(`manager/tenant/${boardingHouseId}/${accountId}`);
};
