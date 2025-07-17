import { Empty } from "antd";
import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const RevenueMonthlyView = ({ monthlyData, formatter, monthlyExpenses, t }) => {
  const COLORS = {
    profit: "#10B981", // green-500
    utilityExpenses: "#EF4444", // red-500
    otherExpenses: "#6366F1", // indigo-500
    revenue: "#38bdf8", // blue-500
  };

  if (
    !monthlyData ||
    !monthlyData.transactions ||
    monthlyData.transactions.length === 0
  ) {
    return <Empty description={t("monthlyView.noData")} />;
  }

  // Calculate total utility expenses
  const totalUtilityExpenses = monthlyExpenses
    ? (monthlyExpenses.electricalExpense?.totalAmount || 0) +
      (monthlyExpenses.waterExpense?.totalAmount || 0)
    : 0;

  // Calculate other expenses
  const totalOtherExpenses = monthlyExpenses
    ? monthlyExpenses.otherExpenses?.reduce(
        (total, expense) => total + (expense.feeAmount || 0),
        0
      )
    : 0;

  // Calculate paid transactions and total paid amount
  const paidTransactions = monthlyData.transactions.filter(
    (t) => t.status === "paid"
  );
  const totalPaidAmount = paidTransactions.reduce(
    (total, transaction) => total + transaction.paymentAmount,
    0
  );

  // Calculate net profit (total paid amount minus all expenses)
  const netProfit = totalPaidAmount - totalUtilityExpenses - totalOtherExpenses;

  // Prepare data for the pie chart
  const pieData = [
    {
      name: t("monthlyView.netProfit"),
      value: netProfit,
      color: COLORS.profit,
    },
    {
      name: t("monthlyView.utilityExpenses"),
      value: totalUtilityExpenses,
      color: COLORS.utilityExpenses,
    },
    {
      name: t("monthlyView.otherExpenses"),
      value: totalOtherExpenses,
      color: COLORS.otherExpenses,
    },
  ];

  // Prepare data for the bar chart
  const barData = [
    {
      name: t("monthlyView.totalRevenue"),
      value: totalPaidAmount,
      color: COLORS.revenue,
    },
    {
      name: t("monthlyView.utilityExpenses"),
      value: totalUtilityExpenses,
      color: COLORS.utilityExpenses,
    },
    {
      name: t("monthlyView.otherExpenses"),
      value: totalOtherExpenses,
      color: COLORS.otherExpenses,
    },
    {
      name: t("monthlyView.netProfit"),
      value: netProfit,
      color: COLORS.profit,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        {t("monthlyView.title")}
      </h2>

      {/* Summary cards - matching yearly view layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">
            {t("monthlyView.totalRevenue")}
          </p>
          <p className="text-2xl font-bold text-blue-700">
            {formatter.formatPrice(totalPaidAmount)}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <p className="text-sm text-purple-600 font-medium">
            {t("monthlyView.netProfit")}
          </p>
          <p className="text-2xl font-bold text-purple-700">
            {formatter.formatPrice(netProfit)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <p className="text-sm text-red-600 font-medium">
            {t("monthlyView.utilityExpenses")}
          </p>
          <p className="text-2xl font-bold text-red-700">
            {formatter.formatPrice(totalUtilityExpenses)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <p className="text-sm text-green-600 font-medium">
            {t("monthlyView.otherExpenses")}
          </p>
          <p className="text-2xl font-bold text-green-700">
            {formatter.formatPrice(totalOtherExpenses)}
          </p>
        </div>
      </div>

      {/* Charts layout matching yearly view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            {t("monthlyView.title")} - {t("yearlyView.revenue")}
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={barData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip formatter={(value) => formatter.formatPrice(value)} />
              <Legend />
              <Bar dataKey="value" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            {t("monthlyView.expenseAllocation")}
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => {
                  // Only show label if percentage is greater than 5%
                  return percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : "";
                }}
                labelLine={false}
              >
                {pieData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatter.formatPrice(value)}
                labelFormatter={(label) => `${label}`}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RevenueMonthlyView;
