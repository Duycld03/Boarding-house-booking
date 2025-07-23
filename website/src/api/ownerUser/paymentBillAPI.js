import axios from "../axios.config";

export const getPaymentBillByBoardingHouseId = (
  boardingHouseId,
  paginationOptions = {}
) => {
  const params = {
    ...paginationOptions,
  };

  return axios.get(`/staff/rent-payment/${boardingHouseId}`, { params });
};

export const calculateMonthlyBill = (data) => {
  return axios.post("/staff/calculate-monthly-bill", data);
};

export const calculateBulkMonthlyBill = (data) => {
  return axios.post("/staff/calculate-bulk-monthly-bill", data);
};
