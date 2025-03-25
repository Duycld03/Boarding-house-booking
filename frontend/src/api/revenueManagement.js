import axios from './axios.config';

export const getAvailableYears = async (boardingHouseId) => {

    return axios.get("/owner/revenue/years", {
        params: { boardingHouseId }
    });
};


export const getRevenueByYear = async ({ boardingHouseId, year }) => {
    return axios.get("/owner/revenue/year", {
        params: { boardingHouseId, year }
    });
};

export const getRevenueByTime = async ({ boardingHouseId, month, year }) => {
    return axios.get("/owner/revenue", {
        params: { boardingHouseId, month, year }
    });
};
