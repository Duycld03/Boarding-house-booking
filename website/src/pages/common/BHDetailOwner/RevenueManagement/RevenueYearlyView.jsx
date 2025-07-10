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

const RevenueYearlyView = ({ yearlyData }) => {
  const [viewMode, setViewMode] = useState("month"); // "month" or "year"

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
      profitMargin: ((totalProfit / totalRevenue) * 100).toFixed(1),
    };
  };

  const summaryData = calculateYearlySummary();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div>
      {/* Yearly summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-lg text-blue-600 font-medium">
            Total Annual Revenue
          </p>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency(summaryData.totalRevenue)}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-lg text-blue-600 font-medium">Average Revenue</p>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency(summaryData.averageRevenue)}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <p className="text-lg text-purple-600 font-medium">Total Profit</p>
          <p className="text-2xl font-bold text-purple-700">
            {formatCurrency(summaryData.totalProfit)}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <p className="text-lg text-purple-600 font-medium">Profit Margin</p>
          <p className="text-2xl font-bold text-purple-700">
            {summaryData.profitMargin}%
          </p>
        </div>
      </div>

      {/* Charts - Only show when in "month" view */}
      {viewMode === "month" && (
        <>
          {/* Bar chart */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Monthly Revenue
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={yearlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill={COLORS.revenue} />
                <Bar dataKey="profit" name="Profit" fill={COLORS.profit} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line chart */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Monthly Expenses
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={yearlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="electricityWaterCost"
                  name="Electricity & Water"
                  stroke={COLORS.electricity}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="otherCosts"
                  name="Other Costs"
                  stroke={COLORS.otherCosts}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default RevenueYearlyView;
