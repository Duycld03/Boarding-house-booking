import axios from "./axios.config";

export const getExpenseByTime = ({ boardingHouseId, month, year }) => {
  return axios.get("/owner/expense", {
    params: { boardingHouseId, month, year },
  });
};

export const updateExpense = ({ expenseId, data }) => {
  return axios.put(`/owner/expense/${expenseId}`, data);
};

export const getTotalExpenseByTime = ({ month, year }) => {
  return axios.get("/owner/total-expense", {
    params: { month, year },
  });
};
