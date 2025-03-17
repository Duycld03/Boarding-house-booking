import axios from './axios.config';
export const getRoomTypeByBhId = (id) => {
  return axios.get(`/owner/boardinghouse/room-types/${id}`);
};
