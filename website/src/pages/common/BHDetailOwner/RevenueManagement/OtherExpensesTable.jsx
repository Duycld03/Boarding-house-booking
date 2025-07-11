const OtherExpensesTable = ({
  otherExpenses,
  calculateTotal,
  formatAmount,
  t,
  currentLanguage,
  darkMode,
}) => {
  return (
    <div
      className={`expense-table bg-white rounded-lg border border-gray-200 ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t
            ? t("revenue.expenses.otherExpenses", "Other Expenses")
            : "Other Expenses"}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="p-4 text-left text-xl font-semibold text-gray-600 uppercase tracking-wider">
                {t ? t("revenue.expenses.feeName", "Fee Name") : "Fee Name"}
              </th>
              <th className="p-4 text-right text-xl font-semibold text-gray-600 uppercase tracking-wider">
                {t ? t("revenue.expenses.amount", "Amount") : "Amount"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {otherExpenses?.length > 0 ? (
              otherExpenses.map((expense, index) => (
                <tr key={index}>
                  <td className="p-4 text-xl text-gray-900 font-medium">
                    {expense.feeName}
                  </td>
                  <td className="p-4 text-xl text-gray-900 text-right font-medium">
                    {formatAmount(expense.feeAmount || 0, currentLanguage)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="2"
                  className="p-4 text-center text-lg text-gray-500"
                >
                  {t
                    ? t(
                        "revenue.expenses.noOtherExpenses",
                        "No other expenses added yet"
                      )
                    : "No other expenses added yet"}
                </td>
              </tr>
            )}
            <tr className="bg-gray-50 dark:bg-black font-bold">
              <td className="p-4 text-xl text-gray-900 dark:text-white">
                {t
                  ? t(
                      "revenue.expenses.totalOtherExpenses",
                      "Total Other Expenses"
                    )
                  : "Total Other Expenses"}
              </td>
              <td className="p-4 text-xl text-gray-900 text-right font-extrabold">
                {formatAmount(calculateTotal() || 0, currentLanguage)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OtherExpensesTable;
