import axios from "../axios.config";

export const getPaymentBillByBoardingHouseId = (
  boardingHouseId,
  paginationOptions = {}
) => {
  const params = {
    ...paginationOptions,
  };

  return axios.get(`/owner/rent-payment/${boardingHouseId}`, { params });
};

export const calculateMonthlyBill = (data) => {
  return axios.post("/owner/calculate-monthly-bill", data);
};
