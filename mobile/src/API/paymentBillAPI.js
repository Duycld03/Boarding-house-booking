import axios from "./axios.config";

export const getPaymentBillForRent = (depositRoomId) => {
  return axios.get(`auth/deposit-payment-bill/${depositRoomId}`);
};
