import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import RevenueYearlyView from "./RevenueYearlyView";
import RevenueMonthlyView from "./RevenueMonthlyView";
import { createFormatter } from "@/utils/formatAmount";
import { toast } from "react-toastify";
import {
  getTotalAvailableYears,
  getTotalRevenueByTime,
  getTotalRevenueByYear,
} from "@/api/revenueAPI";
import { getTotalExpenseByTime } from "@/api/boardingHouseExpenseAPI";
import { useTheme } from "@/context/themeContext";

// Colors for the charts
export const COLORS = {
  revenue: "#38bdf8",
  electricity: "#f43f5e",
  water: "#22d3ee",
  otherCosts: "#a3e635",
  profit: "#8b5cf6",
};

const RevenueManagementOwner = () => {
  const { t, i18n } = useTranslation("revenueManagement");
  const { darkMode } = useTheme();

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
  const [isLoading, setIsLoading] = useState(false);

  // Create formatter with current language
  const formatter = createFormatter(i18n.language);

  const fetchAvailableYear = async () => {
    try {
      const response = await getTotalAvailableYears();
      if (response && response.length > 0) {
        setAvailableYear(response);
        // If current year is not in available years, set to first available year
        if (!response.includes(selectedYear)) {
          setSelectedYear(response[0]);
        }
      } else {
        // If no years available, set current year as fallback
        setAvailableYear([currentDate.getFullYear()]);
      }
    } catch (error) {
      console.error("Error fetching available years:", error);
      // Fallback to current year if API fails
      setAvailableYear([currentDate.getFullYear()]);
    }
  };

  useEffect(() => {
    fetchAvailableYear();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchMonthlyData(selectedMonth, selectedYear),
          fetchYearlyData(selectedYear),
          fetchMonthlyExpenses(selectedMonth, selectedYear),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
      setMonthlyData(null);
    }
  };

  const fetchYearlyData = async (year) => {
    try {
      const response = await getTotalRevenueByYear(year);
      if (response && response.monthlyRevenue) {
        // Transform the API response to match the expected format
        const transformedData = response.monthlyRevenue.map((monthData) => {
          const electricityTotal = monthData.summary?.electricityTotal || 0;
          const waterTotal = monthData.summary?.waterTotal || 0;
          const servicesTotal = monthData.summary?.servicesTotal || 0;
          const totalRevenue = monthData.totalRevenue || 0;

          return {
            month: `T${monthData.month}`,
            revenue: totalRevenue,
            electricityWaterCost: electricityTotal + waterTotal,
            otherCosts: servicesTotal,
            profit:
              totalRevenue - (electricityTotal + waterTotal + servicesTotal),
          };
        });
        setYearlyData(transformedData);
      } else {
        setYearlyData([]);
      }
    } catch (error) {
      console.error("Error fetching yearly data:", error);
      setYearlyData([]);
    }
  };

  const fetchMonthlyExpenses = async (month, year) => {
    try {
      const response = await getTotalExpenseByTime({ month, year });
      if (response.data && response.data[0]) {
        const expense = response.data[0];
        setMonthlyExpenses(expense);
      } else {
        // Nếu không có dữ liệu, đặt giá trị mặc định
        setMonthlyExpenses(null);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu chi tiêu hàng tháng:", error);
      setMonthlyExpenses(null);
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

  const monthNames = [
    { value: 1, label: t("months.january") },
    { value: 2, label: t("months.february") },
    { value: 3, label: t("months.march") },
    { value: 4, label: t("months.april") },
    { value: 5, label: t("months.may") },
    { value: 6, label: t("months.june") },
    { value: 7, label: t("months.july") },
    { value: 8, label: t("months.august") },
    { value: 9, label: t("months.september") },
    { value: 10, label: t("months.october") },
    { value: 11, label: t("months.november") },
    { value: 12, label: t("months.december") },
  ];

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-md p-6`}
    >
      <h1
        className={`text-2xl font-bold ${
          darkMode ? "text-gray-100" : "text-gray-800"
        } mb-6`}
      >
        {t("title")}
      </h1>

      {/* Tabs */}
      <div
        className={`flex mb-6 ${
          darkMode ? "bg-gray-700" : "bg-gray-100"
        } rounded-lg p-1`}
      >
        <button
          className={`py-2 px-4 rounded-lg font-medium ${
            activeTab === "monthly"
              ? `${
                  darkMode
                    ? "bg-gray-600 text-white shadow-sm"
                    : "bg-white shadow-sm"
                }`
              : `${darkMode ? "text-gray-300" : "text-gray-600"}`
          }`}
          onClick={() => setActiveTab("monthly")}
        >
          {t("tabs.monthly")}
        </button>
        <button
          className={`py-2 px-4 rounded-lg font-medium ${
            activeTab === "yearly"
              ? `${
                  darkMode
                    ? "bg-gray-600 text-white shadow-sm"
                    : "bg-white shadow-sm"
                }`
              : `${darkMode ? "text-gray-300" : "text-gray-600"}`
          }`}
          onClick={() => setActiveTab("yearly")}
        >
          {t("tabs.yearly")}
        </button>
      </div>

      {/* Filters */}
      <div className="flex mb-6 gap-4">
        {activeTab === "monthly" && (
          <div className="w-1/2">
            <label
              className={`block text-lg font-medium ${
                darkMode ? "text-gray-200" : "text-gray-700"
              } mb-1`}
            >
              {t("filters.month")}
            </label>
            <select
              className={`w-full p-2 border ${
                darkMode
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300 bg-white"
              } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {monthNames.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className={activeTab === "monthly" ? "w-1/2" : "w-1/3"}>
          <label
            className={`block text-lg font-medium ${
              darkMode ? "text-gray-200" : "text-gray-700"
            } mb-1`}
          >
            {t("filters.year")}
          </label>
          <select
            className={`w-full p-2 border ${
              darkMode
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white"
            } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {availableYear?.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span
            className={`ml-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            {t("common.loading")}
          </span>
        </div>
      ) : (
        <>
          {activeTab === "monthly" ? (
            <RevenueMonthlyView
              monthlyData={monthlyData}
              formatter={formatter}
              monthlyExpenses={monthlyExpenses}
              t={t}
              darkMode={darkMode}
            />
          ) : (
            <RevenueYearlyView
              yearlyData={yearlyData}
              summaryData={summaryData}
              selectedYear={selectedYear}
              formatter={formatter}
              t={t}
              darkMode={darkMode}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RevenueManagementOwner;
