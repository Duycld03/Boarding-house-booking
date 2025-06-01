import axios from "./axios.config";

export const getAvailableYears = async (boardingHouseId) => {
  return axios.get("/manager/revenue/years", {
    params: { boardingHouseId },
  });
};

export const getRevenueByYear = async ({ boardingHouseId, year }) => {
  return axios.get("/manager/revenue/year", {
    params: { boardingHouseId, year },
  });
};

export const getRevenueByTime = async ({ boardingHouseId, month, year }) => {
  return axios.get("/manager/revenue", {
    params: { boardingHouseId, month, year },
  });
};

export const getTotalRevenueByYear = async (year) => {
  return axios.get("/manager/total-revenue/year", {
    params: { year },
  });
};

export const getTotalAvailableYears = async () => {
  return axios.get("/manager/total-revenue/years");
};

export const getTotalRevenueByTime = async ({ month, year }) => {
  return axios.get("/manager/total-revenue", {
    params: { month, year },
  });
};
