import axios from "./axios.config";

export const getRentPaymentByUserId = () => {
    return axios.get("auth/rent-payment");
}