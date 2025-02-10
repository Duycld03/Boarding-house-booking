import axios from './axios.config';
export const getFavorite = () => {
  return axios.get('/auth/favorites');
};

export const addFavorite = (boardingHouseId) => {
  return axios.post('/auth/favorites/create', { boardingHouseId });
};
