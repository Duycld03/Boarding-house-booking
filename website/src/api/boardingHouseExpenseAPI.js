import axios from "./axios.config";

export const getExpenseByTime = ({ boardingHouseId, month, year }) => {
  return axios.get("/staff/expense", {
    params: { boardingHouseId, month, year },
  });
};

export const updateExpense = ({ expenseId, data }) => {
  return axios.put(`/staff/expense/${expenseId}`, data);
};

export const getTotalExpenseByTime = ({ month, year }) => {
  return axios.get("/staff/total-expense", {
    params: { month, year },
  });
};

//add new expense for boarding house
export const addExpense = (data) => {
  return axios.post("/staff/expense", data);
};

//delete expense
export const deleteExpense = (expenseId) => {
  return axios.delete(`/staff/expense/${expenseId}`);
};
