import axios from "./axios.config";

export const getExpenseByTime = ({ boardingHouseId, month, year }) => {
  return axios.get("/manager/expense", {
    params: { boardingHouseId, month, year },
  });
};

export const updateExpense = ({ expenseId, data }) => {
  return axios.put(`/manager/expense/${expenseId}`, data);
};

export const getTotalExpenseByTime = ({ month, year }) => {
  return axios.get("/manager/total-expense", {
    params: { month, year },
  });
};
