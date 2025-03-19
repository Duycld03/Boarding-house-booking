import axios from "./axios.config";

export const getRentPaymentByUserId = () => {
    return axios.get("/auth/user-payment");
}