import React from "react";

const OtherExpensesTable = ({
  otherExpenses,
  onAdd,
  calculateTotal,
  formatCurrency,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-3xl font-bold text-gray-800">Other Expenses</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left text-xl font-semibold text-gray-600 uppercase tracking-wider">
                Fee Name
              </th>
              <th className="p-4 text-right text-xl font-semibold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {otherExpenses?.length > 0 ? (
              otherExpenses.map((expense, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-4 text-xl text-gray-900 font-medium">
                    {expense.feeName}
                  </td>
                  <td className="p-4 text-xl text-gray-900 text-right font-medium">
                    {formatCurrency(expense.feeAmount || 0)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="2"
                  className="p-4 text-center text-lg text-gray-500"
                >
                  No other expenses added yet
                </td>
              </tr>
            )}
            <tr className="bg-gray-50 font-bold">
              <td className="p-4 text-xl text-gray-900">
                Total Other Expenses
              </td>
              <td className="p-4 text-xl text-gray-900 text-right font-extrabold">
                {formatCurrency(calculateTotal() || 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OtherExpensesTable;
