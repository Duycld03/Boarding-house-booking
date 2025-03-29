import axios from "../axios.config";

export const getPaymentBillByBoardingHouseId = (boardingHouseId) => {
  return axios.get(`/owner/rent-payment/${boardingHouseId}`);
};
