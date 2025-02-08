import axios from './axios.config';

export const addFavorite = (boardingHouseId) => {
  return axios.post('/auth/favorites', { boardingHouseId });
};
