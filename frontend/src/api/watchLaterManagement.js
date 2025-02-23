import axios from "./axios.config";
export const getWatchLater = () => {
  return axios.get("/auth/watchlater");
};

export const createWatchLater = (boardingHouseId) => {
  return axios.post("/auth/watchlater/create", { boardingHouseId });
};

export const deleteWatchLater = (watchLaterId) => {
  return axios.delete(`/auth/watchlater/${watchLaterId}`);
};
