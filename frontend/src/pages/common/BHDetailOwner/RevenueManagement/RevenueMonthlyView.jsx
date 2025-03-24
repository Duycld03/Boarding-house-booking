import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { COLORS } from "./index";

const RevenueMonthlyView = ({ monthlyData, formatCurrency }) => {
  if (!monthlyData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
        Không có dữ liệu doanh thu cho tháng này.
      </div>
    );
  }

  // Prepare data for the pie chart
  const pieData = [
    {
      name: "Lợi nhuận",
      value: monthlyData.netProfit,
      color: COLORS.profit,
    },
    {
      name: "Điện nước",
      value: monthlyData.electricityWaterCost,
      color: COLORS.electricity,
    },
    {
      name: "Chi phí khác",
      value: monthlyData.otherCosts,
      color: COLORS.otherCosts,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">Tổng Doanh Thu</p>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency(monthlyData.totalRevenue)}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <p className="text-sm text-purple-600 font-medium">Lợi Nhuận</p>
          <p className="text-2xl font-bold text-purple-700">
            {formatCurrency(monthlyData.netProfit)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <p className="text-sm text-red-600 font-medium">Điện Nước</p>
          <p className="text-2xl font-bold text-red-700">
            {formatCurrency(monthlyData.electricityWaterCost)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <p className="text-sm text-green-600 font-medium">Chi Phí Khác</p>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(monthlyData.otherCosts)}
          </p>
        </div>
      </div>

      {/* Pie chart */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Phân Bổ Chi Phí
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {pieData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueMonthlyView;
