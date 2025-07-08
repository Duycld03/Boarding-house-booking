import axios from "./axios.config";

export const getPaymentBillForRent = (paymentBillId) => {
  return axios.get(`auth/deposit-payment-bill/${paymentBillId}`);
};
