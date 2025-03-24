import React, { useState, useEffect } from "react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const RevenueManagement = ({ boardingHouseId }) => {
  // Get current month and year for default values
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState([]);
  const [activeTab, setActiveTab] = useState("monthly");

  // Colors for the charts
  const COLORS = {
    revenue: "#38bdf8",
    electricity: "#f43f5e",
    otherCosts: "#a3e635",
    profit: "#8b5cf6",
  };

  useEffect(() => {
    fetchMonthlyData(selectedMonth, selectedYear);
    fetchYearlyData(selectedYear);
  }, [selectedMonth, selectedYear, boardingHouseId]);

  const fetchMonthlyData = (month, year) => {
    // Simulated API call - replace with actual API call
    const data = {
      totalRevenue: 5000,
      transactionCount: 10,
      transactions: ["txn1", "txn2"],
      electricityWaterCost: 1200,
      otherCosts: 800,
      netProfit: 3000,
    };
    setMonthlyData(data);
  };

  const fetchYearlyData = (year) => {
    // Simulated API call - replace with actual API call
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
      {
        month: "T3",
        revenue: 5000,
        electricityWaterCost: 1200,
        otherCosts: 800,
        profit: 3000,
      },
      {
        month: "T4",
        revenue: 4200,
        electricityWaterCost: 1100,
        otherCosts: 700,
        profit: 2400,
      },
      {
        month: "T5",
        revenue: 4800,
        electricityWaterCost: 1300,
        otherCosts: 900,
        profit: 2600,
      },
      {
        month: "T6",
        revenue: 5200,
        electricityWaterCost: 1400,
        otherCosts: 1000,
        profit: 2800,
      },
      {
        month: "T7",
        revenue: 4900,
        electricityWaterCost: 1200,
        otherCosts: 800,
        profit: 2900,
      },
      {
        month: "T8",
        revenue: 5500,
        electricityWaterCost: 1500,
        otherCosts: 1100,
        profit: 2900,
      },
      {
        month: "T9",
        revenue: 5300,
        electricityWaterCost: 1400,
        otherCosts: 900,
        profit: 3000,
      },
      {
        month: "T10",
        revenue: 6000,
        electricityWaterCost: 1600,
        otherCosts: 1200,
        profit: 3200,
      },
      {
        month: "T11",
        revenue: 5800,
        electricityWaterCost: 1500,
        otherCosts: 1100,
        profit: 3200,
      },
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

  // Prepare data for the pie chart
  const pieData = monthlyData
    ? [
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
      ]
    : [];

  // Calculate summary metrics
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

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Tabs */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          className={`py-2 px-4 rounded-lg font-medium ${
            activeTab === "monthly" ? "bg-white shadow-sm" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("monthly")}
        >
          Tháng
        </button>
        <button
          className={`py-2 px-4 rounded-lg font-medium ${
            activeTab === "yearly" ? "bg-white shadow-sm" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("yearly")}
        >
          Năm
        </button>
      </div>

      {/* Filters */}
      <div className="flex mb-6 gap-4">
        <div className="w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tháng
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Năm
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {[2023, 2024, 2025].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeTab === "monthly" ? (
        <div>
          {monthlyData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium">
                    Tổng Doanh Thu
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(monthlyData.totalRevenue)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <p className="text-sm text-purple-600 font-medium">
                    Lợi Nhuận
                  </p>
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
                  <p className="text-sm text-green-600 font-medium">
                    Chi Phí Khác
                  </p>
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
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
              Không có dữ liệu doanh thu cho tháng này.
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Yearly summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-600 font-medium">
                Tổng Doanh Thu Năm
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(summaryData.totalRevenue)}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-600 font-medium">
                Doanh Thu Trung Bình
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(summaryData.averageRevenue)}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <p className="text-sm text-purple-600 font-medium">
                Tổng Lợi Nhuận
              </p>
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(summaryData.totalProfit)}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <p className="text-sm text-purple-600 font-medium">
                Tỷ Suất Lợi Nhuận
              </p>
              <p className="text-2xl font-bold text-purple-700">
                {summaryData.profitMargin}%
              </p>
            </div>
          </div>

          {/* Bar chart */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Doanh Thu Theo Tháng
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
                <Bar dataKey="revenue" name="Doanh Thu" fill={COLORS.revenue} />
                <Bar dataKey="profit" name="Lợi Nhuận" fill={COLORS.profit} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line chart */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Chi Phí Theo Tháng
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
                  name="Điện Nước"
                  stroke={COLORS.electricity}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="otherCosts"
                  name="Chi Phí Khác"
                  stroke={COLORS.otherCosts}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueManagement;
