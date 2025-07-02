import axios from "@/api/axios.config";

export const getRoomAdditionFeeForMonthlyCalculate = (roomId) => {
  return axios.get(`/staff/room-addition-fee/calculate-rent/${roomId}`);
};
