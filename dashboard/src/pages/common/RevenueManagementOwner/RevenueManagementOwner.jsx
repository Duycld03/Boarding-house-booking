import React, { useState, useEffect } from "react";
import RevenueYearlyView from "./RevenueYearlyView";
import RevenueMonthlyView from "./RevenueMonthlyView";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "react-toastify";
import {
  getTotalAvailableYears,
  getTotalRevenueByTime,
} from "@/api/revenueManagement";
import { getTotalExpenseByTime } from "@/api/expense";

// Colors for the charts
export const COLORS = {
  revenue: "#38bdf8",
  electricity: "#f43f5e",
  water: "#22d3ee",
  otherCosts: "#a3e635",
  profit: "#8b5cf6",
};

const RevenueManagementOwner = () => {
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
  const [availableYear, setAvailableYear] = useState([]);

  const fetchAvailableYear = async () => {
    try {
      const response = await getTotalAvailableYears();
      if (response) {
        setAvailableYear(response);
      }
    } catch (error) {
      console.error("Error fetching available years:", error);
    }
  };

  useEffect(() => {
    fetchAvailableYear();
  }, []);

  useEffect(() => {
    fetchMonthlyData(selectedMonth, selectedYear);
    fetchYearlyData(selectedYear);
    fetchMonthlyExpenses(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const fetchMonthlyData = async (month, year) => {
    try {
      const response = await getTotalRevenueByTime({
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

  const fetchMonthlyExpenses = async (month, year) => {
    try {
      const response = await getTotalExpenseByTime({ month, year });
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
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu chi tiêu hàng tháng:", error);
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
                className={`py-2 px-4 rounded-lg font-medium flex-1 "bg-white shadow-sm"`}
              >
                Revenue
              </button>
            </div>
          )}
          <RevenueMonthlyView
            monthlyData={monthlyData}
            formatCurrency={formatCurrency}
            monthlyExpenses={monthlyExpenses}
          />
        </div>
      ) : (
        <RevenueYearlyView
          yearlyData={yearlyData}
          summaryData={summaryData}
          selectedYear={selectedYear}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

export default RevenueManagementOwner;
