import React from "react";

const ExpenseDetailsCard = ({
  title,
  expense,
  colorClass,
  unit,
  onEdit,
  formatAmount,
  currentLanguage,
  t,
  darkMode,
}) => {
  return (
    <div
      className={`expense-details-card bg-white rounded-lg border border-gray-200 p-4 ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <h3 className="text-3xl font-bold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            {t
              ? t("revenue.expenses.previousReading", "Previous Reading")
              : "Previous Reading"}
            :
          </span>
          <span className="font-medium">{expense?.oldNumber || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            {t
              ? t("revenue.expenses.currentReading", "Current Reading")
              : "Current Reading"}
            :
          </span>
          <span className="font-medium">{expense?.newNumber || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            {t
              ? t("revenue.expenses.consumption", "Consumption")
              : "Consumption"}
            :
          </span>
          <span className="font-medium">
            {expense?.quantityConsumed || 0} {unit}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-gray-600 font-medium">
            {t
              ? t("revenue.expenses.totalAmount", "Total Amount")
              : "Total Amount"}
            :
          </span>
          <span className={`font-bold text-${colorClass}-600`}>
            {formatAmount(expense?.totalAmount || 0, currentLanguage)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailsCard;
