import React, { useState } from "react";
import {
  BarChart,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  Line,
  ResponsiveContainer,
} from "recharts";

const RevenueYearlyView = ({ yearlyData, t, formatter, darkMode }) => {
  const COLORS = {
    revenue: "#38bdf8",
    electricity: "#f43f5e",
    water: "#22d3ee",
    otherCosts: "#a3e635",
    profit: "#8b5cf6",
  };

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
      profitMargin:
        totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0,
    };
  };

  const summaryData = calculateYearlySummary();

  return (
    <div>
      <h2
        className={`text-xl font-semibold mb-6 ${
          darkMode ? "text-gray-100" : "text-gray-800"
        }`}
      >
        {t("yearlyView.title")}
      </h2>

      {/* Yearly summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          className={`${
            darkMode
              ? "bg-blue-900/50 border-blue-800"
              : "bg-blue-50 border-blue-100"
          } p-4 rounded-lg border`}
        >
          <p
            className={`text-sm ${
              darkMode ? "text-blue-300" : "text-blue-600"
            } font-medium`}
          >
            {t("yearlyView.totalAnnualRevenue")}
          </p>
          <p
            className={`text-2xl font-bold ${
              darkMode ? "text-blue-200" : "text-blue-700"
            }`}
          >
            {formatter.formatPrice(summaryData.totalRevenue)}
          </p>
        </div>
        <div
          className={`${
            darkMode
              ? "bg-blue-900/50 border-blue-800"
              : "bg-blue-50 border-blue-100"
          } p-4 rounded-lg border`}
        >
          <p
            className={`text-sm ${
              darkMode ? "text-blue-300" : "text-blue-600"
            } font-medium`}
          >
            {t("yearlyView.averageRevenue")}
          </p>
          <p
            className={`text-2xl font-bold ${
              darkMode ? "text-blue-200" : "text-blue-700"
            }`}
          >
            {formatter.formatPrice(summaryData.averageRevenue)}
          </p>
        </div>
        <div
          className={`${
            darkMode
              ? "bg-purple-900/50 border-purple-800"
              : "bg-purple-50 border-purple-100"
          } p-4 rounded-lg border`}
        >
          <p
            className={`text-sm ${
              darkMode ? "text-purple-300" : "text-purple-600"
            } font-medium`}
          >
            {t("yearlyView.totalProfit")}
          </p>
          <p
            className={`text-2xl font-bold ${
              darkMode ? "text-purple-200" : "text-purple-700"
            }`}
          >
            {formatter.formatPrice(summaryData.totalProfit)}
          </p>
        </div>
        <div
          className={`${
            darkMode
              ? "bg-purple-900/50 border-purple-800"
              : "bg-purple-50 border-purple-100"
          } p-4 rounded-lg border`}
        >
          <p
            className={`text-sm ${
              darkMode ? "text-purple-300" : "text-purple-600"
            } font-medium`}
          >
            {t("yearlyView.profitMargin")}
          </p>
          <p
            className={`text-2xl font-bold ${
              darkMode ? "text-purple-200" : "text-purple-700"
            }`}
          >
            {summaryData.profitMargin}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div
          className={`${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          } p-4 rounded-lg border`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {t("yearlyView.monthlyRevenue")}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={yearlyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatter.formatPrice(value)} />
              <Legend />
              <Bar
                dataKey="revenue"
                name={t("yearlyView.revenue")}
                fill={COLORS.revenue}
              />
              <Bar
                dataKey="profit"
                name={t("yearlyView.profit")}
                fill={COLORS.profit}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart */}
        <div
          className={`${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          } p-4 rounded-lg border`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {t("yearlyView.monthlyExpenses")}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={yearlyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatter.formatPrice(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="electricityWaterCost"
                name={t("yearlyView.electricityWater")}
                stroke={COLORS.electricity}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="otherCosts"
                name={t("yearlyView.otherCosts")}
                stroke={COLORS.otherCosts}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RevenueYearlyView;
