import axios from "@/api/axios.config";

export const updatePaymentBill = async (paymentBillId, paymentData) => {
  return axios.put(`/staff/payment-bill/${paymentBillId}`, paymentData);
};

export const getPaymentBillById = async (paymentBillId) => {
  return axios.get(`/staff/payment-bill/${paymentBillId}`);
};
