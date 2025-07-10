import React, { useState, useEffect } from "react";
import {
  getExpenseByTime,
  updateExpense,
  addExpense,
  deleteExpense,
} from "@/api/boardingHouseExpenseAPI";
import { Modal, Empty, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import RevenueMonthlyView from "./RevenueMonthlyView";
import ExpenseMonthlyView from "./ExpenseMonthlyView";
import ExpenseUpdateForm from "./ExpenseUpdateForm";
import formatAmount from "@/utils/formatAmount";
import { toast } from "react-toastify";
import { getRevenueByTime } from "@/api/revenueAPI";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import "./RevenueManagement.css"; // Import custom styles
import { useTheme } from "@/context/ThemeContext";

// Colors for the charts
export const COLORS = {
  revenue: "#38bdf8",
  electricity: "#f43f5e",
  water: "#22d3ee",
  otherCosts: "#a3e635",
  profit: "#8b5cf6",
};

const RevenueManagement = ({ boardingHouseId }) => {
  // Get current month and year for default values
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState(null);
  const [expenseView, setExpenseView] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddNewExpense, setIsAddNewExpense] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { t } = useTranslation("bhManagement");
  const currentLanguage = i18next.language;
  const { darkMode } = useTheme();

  // Tạo mảng 10 năm gần nhất
  const currentYear = currentDate.getFullYear();
  const recentYears = Array.from(
    { length: 10 },
    (_, index) => currentYear - index
  );

  const [expenseFormData, setExpenseFormData] = useState({
    id: undefined,
    electricalExpense: {
      oldNumber: 0,
      newNumber: 0,
      quantityConsumed: 0,
      totalAmount: 0,
    },
    waterExpense: {
      oldNumber: 0,
      newNumber: 0,
      quantityConsumed: 0,
      totalAmount: 0,
    },
    otherExpenses: [],
  });

  useEffect(() => {
    fetchMonthlyData(selectedMonth, selectedYear);
    fetchYearlyData(selectedYear);
    fetchMonthlyExpenses(selectedMonth, selectedYear, boardingHouseId);
  }, [selectedMonth, selectedYear, boardingHouseId]);

  const fetchMonthlyData = async (month, year) => {
    setIsLoading(true);
    try {
      const response = await getRevenueByTime({
        boardingHouseId,
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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchYearlyData = (year) => {
    const data = [
      {
        month: "T1",
        revenue: 4000,
        electricityWaterCost: 1000,
        otherCosts: 600,
        profit: 2400,
      },
      {
        month: "T2",
        revenue: 3500,
        electricityWaterCost: 900,
        otherCosts: 500,
        profit: 2100,
      },
      // ... other months (truncated for brevity)
      {
        month: "T12",
        revenue: 6500,
        electricityWaterCost: 1700,
        otherCosts: 1300,
        profit: 3500,
      },
    ];
    setYearlyData(data);
  };

  const fetchMonthlyExpenses = async (month, year, boardingHouseId) => {
    setIsLoading(true);
    try {
      const response = await getExpenseByTime({ boardingHouseId, month, year });
      if (response.data && response.data[0]) {
        const expense = response.data[0];
        setMonthlyExpenses(expense);

        setExpenseFormData({
          id: expense._id || null, // Lấy ID nếu có
          electricalExpense: expense.electricalExpense || {
            oldNumber: 0,
            newNumber: 0,
            quantityConsumed: 0,
            totalAmount: 0,
          },
          waterExpense: expense.waterExpense || {
            oldNumber: 0,
            newNumber: 0,
            quantityConsumed: 0,
            totalAmount: 0,
          },
          otherExpenses: expense.otherExpenses || [],
        });
      } else {
        // Nếu không có dữ liệu, đặt giá trị mặc định
        setMonthlyExpenses(null);
        setExpenseFormData({
          id: null,
          electricalExpense: {
            oldNumber: 0,
            newNumber: 0,
            quantityConsumed: 0,
            totalAmount: 0,
          },
          waterExpense: {
            oldNumber: 0,
            newNumber: 0,
            quantityConsumed: 0,
            totalAmount: 0,
          },
          otherExpenses: [],
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu chi tiêu hàng tháng:", error);
      setMonthlyExpenses(null);
      setExpenseFormData({
        id: null,
        electricalExpense: {
          oldNumber: 0,
          newNumber: 0,
          quantityConsumed: 0,
          totalAmount: 0,
        },
        waterExpense: {
          oldNumber: 0,
          newNumber: 0,
          quantityConsumed: 0,
          totalAmount: 0,
        },
        otherExpenses: [],
      });
    } finally {
      setIsLoading(false);
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

  const handleEditElectrical = () => {
    handleUpdateExpense();
  };

  const handleEditWater = () => {
    handleUpdateExpense();
  };

  const handleEditOtherExpense = (index) => {
    handleUpdateExpense();
  };

  const handleRefreshChart = () => {
    fetchMonthlyExpenses(selectedMonth, selectedYear, boardingHouseId);
  };

  const handleUpdateExpense = () => {
    setIsAddNewExpense(false);
    setShowUpdateModal(true);
  };

  // Hàm xử lý khi nhấn nút "Add New Expense"
  const handleAddNewExpense = () => {
    setIsAddNewExpense(true);
    setShowUpdateModal(true);
    // Luôn set empty form data khi thêm mới
    setExpenseFormData({
      id: null,
      electricalExpense: {
        oldNumber: 0,
        newNumber: 0,
        quantityConsumed: 0,
        totalAmount: 0,
      },
      waterExpense: {
        oldNumber: 0,
        newNumber: 0,
        quantityConsumed: 0,
        totalAmount: 0,
      },
      otherExpenses: [
        {
          feeName: "",
          feeAmount: 0,
        },
      ],
    });
  };

  // Thêm hàm xóa chi phí
  const handleDeleteExpense = async () => {
    if (!monthlyExpenses || !monthlyExpenses._id) {
      toast.error(
        t("revenue.errors.noExpenseToDelete", "No expense to delete")
      );
      return;
    }

    setIsDeleting(true);
    try {
      await deleteExpense(monthlyExpenses._id);
      toast.success(
        t("revenue.success.expenseDeleted", "Expense deleted successfully")
      );

      // Cập nhật lại dữ liệu sau khi xóa
      setMonthlyExpenses(null);
      setExpenseFormData({
        id: null,
        electricalExpense: {
          oldNumber: 0,
          newNumber: 0,
          quantityConsumed: 0,
          totalAmount: 0,
        },
        waterExpense: {
          oldNumber: 0,
          newNumber: 0,
          quantityConsumed: 0,
          totalAmount: 0,
        },
        otherExpenses: [],
      });

      // Tải lại dữ liệu
      fetchMonthlyExpenses(selectedMonth, selectedYear, boardingHouseId);
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error(
        t(
          "revenue.errors.deleteExpense",
          "Cannot delete expense: {{message}}",
          {
            message:
              error.response?.data?.message ||
              t("revenue.errors.unknownError", "Unknown error"),
          }
        )
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitExpense = async (formValues) => {
    setIsSubmitting(true);
    try {
      // Prepare data for submission
      const expenseData = {
        boardingHouseId,
        month: selectedMonth,
        year: selectedYear,
        electricalExpense: formValues.electricalExpense,
        waterExpense: formValues.waterExpense,
        otherExpenses: formValues.otherExpenses,
      };

      if (isAddNewExpense) {
        // Thêm mới expense
        await addExpense(expenseData);
        toast.success(
          t("revenue.success.expenseAdded", "Added new expense successfully")
        );
      } else {
        // Cập nhật expense
        await updateExpense({
          data: expenseData,
          expenseId: formValues?.id,
        });
        toast.success(
          t("revenue.success.expenseUpdated", "Updated expense successfully")
        );
      }

      // Refresh the data
      fetchMonthlyExpenses(selectedMonth, selectedYear, boardingHouseId);
      setShowUpdateModal(false);
    } catch (error) {
      const action = isAddNewExpense ? "add" : "update";
      toast.error(
        t(
          `revenue.errors.${action}Expense`,
          `Cannot ${action} expense. {{message}}`,
          { message: error.response?.data?.message || "" }
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Danh sách các tháng với ngôn ngữ
  const monthNames = {
    1: t("months.january", "January"),
    2: t("months.february", "February"),
    3: t("months.march", "March"),
    4: t("months.april", "April"),
    5: t("months.may", "May"),
    6: t("months.june", "June"),
    7: t("months.july", "July"),
    8: t("months.august", "August"),
    9: t("months.september", "September"),
    10: t("months.october", "October"),
    11: t("months.november", "November"),
    12: t("months.december", "December"),
  };

  // Determine if we should show Add or Update buttons based on expense data
  const showAddButton = !monthlyExpenses;
  const showUpdateButton = !!monthlyExpenses;
  const showDeleteButton = !!monthlyExpenses;

  return (
    <div
      className={`revenue-management-container bg-white rounded-lg shadow-md p-6 ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      {/* Filters */}
      <div className="flex mb-6 gap-4">
        <div className="w-1/2">
          <label className="block text-2xl font-medium text-gray-700 mb-1">
            {t("revenue.filters.month", "Month")}
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            disabled={isLoading}
          >
            {Object.entries(monthNames).map(([num, name]) => (
              <option key={num} value={num}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-1/2">
          <label className="block text-2xl font-medium text-gray-700 mb-1">
            {t("revenue.filters.year", "Year")}
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            disabled={isLoading}
          >
            {recentYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="min-h-[300px]">
        {/* Revenue/Expense toggle - Luôn hiển thị ngay cả khi không có dữ liệu */}
        <div className="tabs-container flex mb-6 bg-gray-100 rounded-lg p-1 w-full md:w-64">
          <button
            className={`tab-button py-2 px-4 rounded-lg font-medium flex-1 ${
              !expenseView ? "active bg-white shadow-sm" : "text-gray-600"
            }`}
            onClick={() => setExpenseView(false)}
          >
            {t("revenue.tabs.revenue", "Revenue")}
          </button>
          <button
            className={`tab-button py-2 px-4 rounded-lg font-medium flex-1 ${
              expenseView ? "active bg-white shadow-sm" : "text-gray-600"
            }`}
            onClick={() => setExpenseView(true)}
          >
            {t("revenue.tabs.expense", "Expense")}
          </button>
        </div>

        {/* Expense Buttons: Add New, Update & Delete - chỉ hiển thị button thích hợp */}
        {expenseView && (
          <div className="mb-6 flex gap-4 flex-wrap">
            {showAddButton && (
              <button
                onClick={handleAddNewExpense}
                className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                {t("revenue.buttons.addNewExpense", "Add New Expense")}
              </button>
            )}
            {showUpdateButton && (
              <button
                onClick={handleUpdateExpense}
                className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t("revenue.buttons.updateExpense", "Update Expense")}
              </button>
            )}
            {/* Thêm nút Delete với Popconfirm */}
            {showDeleteButton && (
              <Popconfirm
                title={t("revenue.confirmDelete.title", "Delete Expense")}
                description={t(
                  "revenue.confirmDelete.description",
                  "Are you sure you want to delete this expense record? This action cannot be undone."
                )}
                onConfirm={handleDeleteExpense}
                okText={t("revenue.confirmDelete.okText", "Yes, Delete")}
                cancelText={t("revenue.confirmDelete.cancelText", "Cancel")}
                okButtonProps={{ danger: true, loading: isDeleting }}
              >
                <button
                  className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                  disabled={isDeleting}
                >
                  <DeleteOutlined className="mr-1" />{" "}
                  {t("revenue.buttons.deleteExpense", "Delete Expense")}
                </button>
              </Popconfirm>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="loading-spinner animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !expenseView ? (
          monthlyData ? (
            <RevenueMonthlyView
              monthlyData={monthlyData}
              formatAmount={formatAmount}
              currentLanguage={currentLanguage}
              monthlyExpenses={monthlyExpenses}
              t={t}
              darkMode={darkMode}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
              <Empty
                description={
                  <span>
                    {t("revenue.noData.revenue", "No revenue data available")}
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )
        ) : monthlyExpenses ? (
          <ExpenseMonthlyView
            monthlyExpenses={monthlyExpenses}
            formatAmount={formatAmount}
            currentLanguage={currentLanguage}
            onEditElectrical={handleEditElectrical}
            onEditWater={handleEditWater}
            onEditOtherExpense={handleEditOtherExpense}
            onRefreshChart={handleRefreshChart}
            t={t}
            darkMode={darkMode}
          />
        ) : (
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
        )}
      </div>

      {/* Ant Design Modal for Update/Add New Expense Form */}
      <Modal
        open={showUpdateModal}
        footer={null}
        onCancel={() => setShowUpdateModal(false)}
        width={700}
        destroyOnClose={true}
        title={
          isAddNewExpense
            ? t("revenue.modal.addExpense", "Add New Expense")
            : t("revenue.modal.updateExpense", "Update Expense")
        }
        className={darkMode ? "dark-mode" : ""}
      >
        <ExpenseUpdateForm
          expenseData={expenseFormData}
          onCancel={() => setShowUpdateModal(false)}
          onSubmit={handleSubmitExpense}
          isLoading={isSubmitting}
          isAddNew={isAddNewExpense}
          t={t}
          currentLanguage={currentLanguage}
          darkMode={darkMode}
        />
      </Modal>
    </div>
  );
};

export default RevenueManagement;
