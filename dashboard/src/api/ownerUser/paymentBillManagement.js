import axios from "../axios.config";

export const getPaymentBillByBoardingHouseId = (boardingHouseId) => {
  return axios.get(`/manager/rent-payment/${boardingHouseId}`);
};

export const calculateMonthlyBill = (data) => {
  return axios.post("/manager/calculate-monthly-bill", data);
};
