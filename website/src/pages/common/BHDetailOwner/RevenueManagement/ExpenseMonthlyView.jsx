// ExpenseMonthlyView.jsx
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Empty } from "antd";
import ExpenseDetailsCard from "./ExpenseDetailsCard";
import OtherExpensesTable from "./OtherExpensesTable";
import { COLORS } from "./index";

const ExpenseMonthlyView = ({
  monthlyExpenses,
  formatAmount,
  currentLanguage,
  t,
  onEditElectrical,
  onEditWater,
  onAddOtherExpense,
  onEditOtherExpense,
  onDeleteOtherExpense,
  onRefreshChart,
  darkMode,
}) => {
  if (!monthlyExpenses) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
        <Empty
          description={
            <span>
              {t("revenue.noData.expense", "No expense data available")}
            </span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  // Calculate total expenses
  const calculateTotalExpenses = () => {
    if (!monthlyExpenses) return 0;

    const electricalCost = monthlyExpenses?.electricalExpense?.totalAmount || 0;
    const waterCost = monthlyExpenses?.waterExpense?.totalAmount || 0;
    const otherCosts =
      monthlyExpenses?.otherExpenses?.reduce(
        (sum, expense) => sum + expense.feeAmount,
        0
      ) || 0;

    return electricalCost + waterCost + otherCosts;
  };

  // Calculate sum of other expenses
  const calculateOtherExpensesTotal = () => {
    if (!monthlyExpenses?.otherExpenses) return 0;
    return monthlyExpenses.otherExpenses.reduce(
      (sum, expense) => sum + expense.feeAmount,
      0
    );
  };

  // Prepare data for the expenses pie chart
  const prepareExpensesPieData = () => {
    if (!monthlyExpenses) return [];

    const expensesData = [
      {
        name: t("revenue.expenses.electricity", "Electricity"),
        value: monthlyExpenses?.electricalExpense?.totalAmount || 0,
        color: COLORS.electricity,
      },
      {
        name: t("revenue.expenses.water", "Water"),
        value: monthlyExpenses?.waterExpense?.totalAmount || 0,
        color: COLORS.water,
      },
    ];

    // Add other expenses
    monthlyExpenses?.otherExpenses?.forEach((expense, index) => {
      expensesData.push({
        name: expense.feeName,
        value: expense.feeAmount,
        // Generate colors dynamically for other expenses
        color: `hsl(${120 + index * 50}, 70%, 50%)`,
      });
    });

    return expensesData;
  };

  const expensesPieData = prepareExpensesPieData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Expense summary cards */}
      <div className="lg:col-span-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="expense-summary-card bg-red-50 p-4 rounded-lg border border-red-100">
            <p className="text-lg text-red-600 font-medium">
              {t("revenue.expenses.totalExpenses", "Total Expenses")}
            </p>
            <p className="text-2xl font-bold text-red-700">
              {formatAmount(calculateTotalExpenses() || 0, currentLanguage)}
            </p>
          </div>
          <div className="expense-summary-card bg-orange-50 p-4 rounded-lg border border-orange-100">
            <p className="text-lg text-orange-600 font-medium">
              {t("revenue.expenses.electricity", "Electricity")}
            </p>
            <p className="text-2xl font-bold text-orange-700">
              {formatAmount(
                monthlyExpenses.electricalExpense?.totalAmount || 0,
                currentLanguage
              )}
            </p>
          </div>
          <div className="expense-summary-card bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-lg text-blue-600 font-medium">
              {t("revenue.expenses.water", "Water")}
            </p>
            <p className="text-2xl font-bold text-blue-700">
              {formatAmount(
                monthlyExpenses.waterExpense?.totalAmount || 0,
                currentLanguage
              )}
            </p>
          </div>
          <div className="expense-summary-card bg-green-50 p-4 rounded-lg border border-green-100">
            <p className="text-lg text-green-600 font-medium">
              {t("revenue.expenses.other", "Other Expenses")}
            </p>
            <p className="text-2xl font-bold text-green-700">
              {formatAmount(
                calculateOtherExpensesTotal() || 0,
                currentLanguage
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Electricity and Water Details */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Electricity Details */}
          <ExpenseDetailsCard
            title={t(
              "revenue.expenses.electricityDetails",
              "Electricity Details"
            )}
            expense={monthlyExpenses.electricalExpense}
            colorClass="orange"
            unit="kWh"
            t={t}
            onEdit={onEditElectrical}
            formatAmount={formatAmount}
            currentLanguage={currentLanguage}
            darkMode={darkMode}
          />

          {/* Water Details */}
          <ExpenseDetailsCard
            title={t("revenue.expenses.waterDetails", "Water Details")}
            expense={monthlyExpenses.waterExpense}
            colorClass="blue"
            unit="m³"
            t={t}
            onEdit={onEditWater}
            formatAmount={formatAmount}
            currentLanguage={currentLanguage}
            darkMode={darkMode}
          />
        </div>

        {/* Other Expenses Table */}
        <OtherExpensesTable
          otherExpenses={monthlyExpenses.otherExpenses || []}
          onAdd={onAddOtherExpense}
          onEdit={onEditOtherExpense}
          onDelete={onDeleteOtherExpense}
          calculateTotal={calculateOtherExpensesTotal}
          formatAmount={formatAmount}
          currentLanguage={currentLanguage}
          t={t}
          darkMode={darkMode}
        />
      </div>

      {/* Expense pie chart */}
      <div className="pie-chart-container bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            {t("revenue.expenses.distribution", "Expense Distribution")}
          </h3>
          <button
            className="refresh-button bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-3 rounded-md text-lg flex items-center"
            onClick={onRefreshChart}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t("revenue.expenses.updateChart", "Update Chart")}
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={expensesPieData || []}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(1)}%`
              }
            >
              {expensesPieData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatAmount(value, currentLanguage)}
              contentStyle={
                darkMode
                  ? { backgroundColor: "#1f1f1f", border: "1px solid #434343" }
                  : {}
              }
              labelStyle={darkMode ? { color: "#d9d9d9" } : {}}
              itemStyle={darkMode ? { color: "#d9d9d9" } : {}}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: darkMode ? "#d9d9d9" : "inherit" }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseMonthlyView;
