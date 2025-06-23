import { Empty } from "antd";
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const RevenueMonthlyView = ({
  monthlyData,
  formatCurrency,
  monthlyExpenses,
}) => {
  const COLORS = {
    profit: "#10B981", // green-500
    utilityExpenses: "#EF4444", // red-500
    otherExpenses: "#6366F1", // indigo-500
  };

  if (
    !monthlyData ||
    !monthlyData.transactions ||
    monthlyData.transactions.length === 0
  ) {
    return <Empty description="No revenue data available for this month." />;
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
      name: "Net Profit",
      value: netProfit,
      color: COLORS.profit,
    },
    {
      name: "Utility Expenses",
      value: totalUtilityExpenses,
      color: COLORS.utilityExpenses,
    },
    {
      name: "Other Expenses",
      value: totalOtherExpenses,
      color: COLORS.otherExpenses,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency(monthlyData.totalRevenue)}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <p className="text-sm text-purple-600 font-medium">Net Profit</p>
          <p className="text-2xl font-bold text-purple-700">
            {formatCurrency(netProfit)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <p className="text-sm text-red-600 font-medium">Utility Expenses</p>
          <p className="text-2xl font-bold text-red-700">
            {formatCurrency(totalUtilityExpenses)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <p className="text-sm text-green-600 font-medium">Other Expenses</p>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(totalOtherExpenses)}
          </p>
        </div>
      </div>

      {/* Pie chart */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Expense Allocation
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
