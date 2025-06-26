import axios from "./axios.config";

export const getRentPaymentByUserId = (paginationOptions = {}) => {
    return axios.get("/auth/user-payment", { params: paginationOptions });
}