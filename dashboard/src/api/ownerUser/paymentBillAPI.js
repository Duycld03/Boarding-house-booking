import axios from "../axios.config";

export const getPaymentBillByBoardingHouseId = (boardingHouseId) => {
  return axios.get(`/owner/rent-payment/${boardingHouseId}`);
};

export const calculateMonthlyBill = (data) => {
  return axios.post("/owner/calculate-monthly-bill", data);
};
