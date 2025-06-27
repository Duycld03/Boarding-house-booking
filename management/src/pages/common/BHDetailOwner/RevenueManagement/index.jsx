import React, { useState, useEffect } from "react";
import { getExpenseByTime, updateExpense } from "@/api/boardingHouseExpenseAPI";
import { Modal } from "antd";
import RevenueMonthlyView from "./RevenueMonthlyView";
import ExpenseMonthlyView from "./ExpenseMonthlyView";
import RevenueYearlyView from "./RevenueYearlyView";
import ExpenseUpdateForm from "./ExpenseUpdateForm";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "react-toastify";
import {
  getRevenueByYear,
  getAvailableYears,
  getRevenueByTime,
} from "@/api/revenueAPI";

// Colors for the charts
export const COLORS = {
  revenue: "#38bdf8",
  electricity: "#f43f5e",
  water: "#22d3ee",
  otherCosts: "#a3e635",
  profit: "#8b5cf6",
};

const RevenueManagement = ({ boardingHouseId }) => {
  // Get current month and year for default values
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState([]);
  const [activeTab, setActiveTab] = useState("monthly");
  const [monthlyExpenses, setMonthlyExpenses] = useState(null);
  const [expenseView, setExpenseView] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [availableYear, setAvailableYear] = useState([]);
  const [expenseFormData, setExpenseFormData] = useState({
    id: undefined,
    electricalExpense: {
      oldNumber: 0,
      newNumber: 0,
      quantityConsumed: 0,
      totalAmount: 0,
    },
    waterExpense: {
      oldNumber: 0,
      newNumber: 0,
      quantityConsumed: 0,
      totalAmount: 0,
    },
    otherExpenses: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAvailableYear = async (boardingHouseId) => {
    try {
      if (!boardingHouseId) return; // Ensure boardingHouseId is valid before calling API

      const response = await getAvailableYears(boardingHouseId);

      if (response) {
        setAvailableYear(response);
      }
    } catch (error) {
      console.error("Error fetching available years:", error);
    }
  };

  useEffect(() => {
    if (boardingHouseId) {
      fetchAvailableYear(boardingHouseId);
    }
  }, [boardingHouseId]);

  useEffect(() => {
    fetchMonthlyData(selectedMonth, selectedYear);
    fetchYearlyData(selectedYear);
    fetchMonthlyExpenses(selectedMonth, selectedYear, boardingHouseId);
  }, [selectedMonth, selectedYear]);

  const fetchMonthlyData = async (month, year) => {
    try {
      const response = await getRevenueByTime({
        boardingHouseId,
        month,
        year,
      });

      // Check if response is valid and has required data
      if (
        response &&
        response.transactions &&
        response.transactions.length > 0
      ) {
        setMonthlyData(response);
      } else {
        // Handle case with no data
        setMonthlyData(null);
        console.warn("No monthly data found");
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setMonthlyData(null);
    }
  };

  const fetchYearlyData = (year) => {
    const data = [
      {
        month: "T1",
        revenue: 4000,
        electricityWaterCost: 1000,
        otherCosts: 600,
        profit: 2400,
      },
      {
        month: "T2",
        revenue: 3500,
        electricityWaterCost: 900,
        otherCosts: 500,
        profit: 2100,
      },
      // ... other months (truncated for brevity)
      {
        month: "T12",
        revenue: 6500,
        electricityWaterCost: 1700,
        otherCosts: 1300,
        profit: 3500,
      },
    ];
    setYearlyData(data);
  };

  const fetchMonthlyExpenses = async (month, year, boardingHouseId) => {
    try {
      const response = await getExpenseByTime({ boardingHouseId, month, year });
      if (response.data && response.data[0]) {
        const expense = response.data[0];
        setMonthlyExpenses(expense);

        setExpenseFormData({
          id: expense._id || null, // Lấy ID nếu có
          electricalExpense: expense.electricalExpense || {
            oldNumber: 0,
            newNumber: 0,
            quantityConsumed: 0,
            totalAmount: 0,
          },
          waterExpense: expense.waterExpense || {
            oldNumber: 0,
            newNumber: 0,
            quantityConsumed: 0,
            totalAmount: 0,
          },
          otherExpenses: expense.otherExpenses || [],
        });
      } else {
        // Nếu không có dữ liệu, đặt giá trị mặc định
        setMonthlyExpenses(null);
        setExpenseFormData({
          id: null,
          electricalExpense: {
            oldNumber: 0,
            newNumber: 0,
            quantityConsumed: 0,
            totalAmount: 0,
          },
          waterExpense: {
            oldNumber: 0,
            newNumber: 0,
            quantityConsumed: 0,
            totalAmount: 0,
          },
          otherExpenses: [],
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu chi tiêu hàng tháng:", error);
      setExpenseFormData({
        id: null,
        electricalExpense: {
          oldNumber: 0,
          newNumber: 0,
          quantityConsumed: 0,
          totalAmount: 0,
        },
        waterExpense: {
          oldNumber: 0,
          newNumber: 0,
          quantityConsumed: 0,
          totalAmount: 0,
        },
        otherExpenses: [],
      });
    }
  };

  // Calculate summary metrics for yearly view
  const calculateYearlySummary = () => {
    if (yearlyData.length === 0) return { total: 0, average: 0 };

    const totalRevenue = yearlyData.reduce(
      (sum, item) => sum + item.revenue,
      0
    );
    const averageRevenue = totalRevenue / yearlyData.length;
    const totalProfit = yearlyData.reduce((sum, item) => sum + item.profit, 0);
    const averageProfit = totalProfit / yearlyData.length;

    return {
      totalRevenue,
      averageRevenue,
      totalProfit,
      averageProfit,
      profitMargin: ((totalProfit / totalRevenue) * 100).toFixed(1),
    };
  };

  const summaryData = calculateYearlySummary();

  const handleEditElectrical = () => {
    // Implement edit functionality
    console.log("Edit electrical expense");
    handleUpdateExpense();
  };

  const handleEditWater = () => {
    // Implement edit functionality
    console.log("Edit water expense");
    handleUpdateExpense();
  };

  const handleEditOtherExpense = (index) => {
    // Implement edit functionality
    console.log("Edit other expense at index", index);
    handleUpdateExpense();
  };

  const handleRefreshChart = () => {
    // Implement refresh functionality
    fetchMonthlyExpenses(selectedMonth, selectedYear, boardingHouseId);
  };

  const handleUpdateExpense = () => {
    setShowUpdateModal(true);
    // If there are no existing expenses, initialize with default values
    if (!monthlyExpenses) {
      setExpenseFormData({
        electricalExpense: {
          oldNumber: 0,
          newNumber: 0,
          quantityConsumed: 0,
          totalAmount: 0,
        },
        waterExpense: {
          oldNumber: 0,
          newNumber: 0,
          quantityConsumed: 0,
          totalAmount: 0,
        },
        otherExpenses: [],
      });
    }
  };

  const handleSubmitExpense = async (formValues) => {
    setIsSubmitting(true);
    try {
      // Prepare data for submission
      const expenseData = {
        boardingHouseId,
        month: selectedMonth,
        year: selectedYear,
        electricalExpense: formValues.electricalExpense,
        waterExpense: formValues.waterExpense,
        otherExpenses: formValues.otherExpenses,
      };

      await updateExpense({
        data: expenseData,
        expenseId: formValues?.id,
      });
      toast.success("Update expense successful");

      // // Refresh the data
      fetchMonthlyExpenses(selectedMonth, selectedYear, boardingHouseId);

      // Close the modal
    } catch (error) {
      toast.error("Can not update expense");
      // You might want to add error handling here (e.g., display an error message)
    } finally {
      setIsSubmitting(false);
    }
  };

  const monthNames = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Tabs */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          className={`py-2 px-4 rounded-lg font-medium ${
            activeTab === "monthly" ? "bg-white shadow-sm" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("monthly")}
        >
          Month
        </button>
        {/* <button
          className={`py-2 px-4 rounded-lg font-medium ${
            activeTab === "yearly" ? "bg-white shadow-sm" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("yearly")}
        >
          Year
        </button> */}
      </div>

      {/* Filters */}
      <div className="flex mb-6 gap-4">
        <div className="w-1/2">
          <label className="block text-lg font-medium text-gray-700 mb-1">
            Month
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {Object.entries(monthNames).map(([num, name]) => (
              <option key={num} value={num}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-1/2">
          <label className="block text-lg font-medium text-gray-700 mb-1">
            Year
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {[availableYear]?.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeTab === "monthly" ? (
        <div>
          {/* Monthly revenue/expense toggle */}
          {monthlyData && (
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1 w-full md:w-64">
              <button
                className={`py-2 px-4 rounded-lg font-medium flex-1 ${
                  !expenseView ? "bg-white shadow-sm" : "text-gray-600"
                }`}
                onClick={() => setExpenseView(false)}
              >
                Revenue
              </button>
              <button
                className={`py-2 px-4 rounded-lg font-medium flex-1 ${
                  expenseView ? "bg-white shadow-sm" : "text-gray-600"
                }`}
                onClick={() => setExpenseView(true)}
              >
                Expense
              </button>
            </div>
          )}

          {/* Update Expense Button */}
          {expenseView && (
            <div className="mb-6">
              <button
                onClick={handleUpdateExpense}
                className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Update expense
              </button>
            </div>
          )}

          {!expenseView ? (
            <RevenueMonthlyView
              monthlyData={monthlyData}
              formatCurrency={formatCurrency}
              monthlyExpenses={monthlyExpenses}
            />
          ) : (
            <ExpenseMonthlyView
              monthlyExpenses={monthlyExpenses}
              formatCurrency={formatCurrency}
              onEditElectrical={handleEditElectrical}
              onEditWater={handleEditWater}
              onEditOtherExpense={handleEditOtherExpense}
              onRefreshChart={handleRefreshChart}
            />
          )}
        </div>
      ) : (
        <RevenueYearlyView
          yearlyData={yearlyData}
          summaryData={summaryData}
          selectedYear={selectedYear}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Ant Design Modal for Update Expense Form */}
      <Modal
        open={showUpdateModal}
        footer={null}
        onCancel={() => setShowUpdateModal(false)}
        width={700}
        destroyOnClose={true}
      >
        <ExpenseUpdateForm
          expenseData={expenseFormData}
          onCancel={() => setShowUpdateModal(false)}
          onSubmit={handleSubmitExpense}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default RevenueManagement;
