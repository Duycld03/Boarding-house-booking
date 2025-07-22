import React from "react";
import { HomeOutlined, RocketOutlined, CrownOutlined } from "@ant-design/icons";

export const plans = [
  {
    key: "FREE",
    name: "Free",
    nameVi: "Miễn phí",
    subtitle: "Perfect for getting started",
    subtitleVi: "Hoàn hảo để bắt đầu",
    monthlyPrice: 0,
    monthlyPriceVND: 0,
    yearlyPrice: 0,
    yearlyPriceVND: 0,
    originalYearlyPrice: 0,
    originalYearlyPriceVND: 0,
    color: "#52c41a",
    gradient: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
    icon: <HomeOutlined />,
    features: [
      "1 Boarding House",
      "Up to 5 Rooms",
      "No Staff Management",
      "Basic dashboard",
      "Email support",
    ],
    featuresVi: [
      "1 Nhà trọ",
      "Tối đa 5 phòng",
      "Không có quản lý nhân viên",
      "Bảng điều khiển cơ bản",
      "Hỗ trợ qua email",
    ],
    limits: {
      boardingHouses: 1,
      rooms: 5,
      staff: 0,
    },
    popular: false,
    badge: null,
    badgeVi: null,
  },
  {
    key: "STANDARD",
    name: "Standard",
    nameVi: "Tiêu chuẩn",
    subtitle: "Best for growing businesses",
    subtitleVi: "Tốt nhất cho doanh nghiệp đang phát triển",
    monthlyPrice: 299000, // 299.000 VND
    monthlyPriceVND: 299000,
    yearlyPrice: 2990000, // 2.990.000 VND (tiết kiệm ~17%)
    yearlyPriceVND: 2990000,
    originalYearlyPrice: 3588000, // 3.588.000 VND
    originalYearlyPriceVND: 3588000,
    color: "#1890ff",
    gradient: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
    icon: <RocketOutlined />,
    features: [
      "Up to 5 Boarding Houses",
      "Up to 30 Rooms",
      "Up to 3 Staff Members",
      "Revenue Reports",
      "Review Reply System",
      "Priority Support",
    ],
    featuresVi: [
      "Tối đa 5 nhà trọ",
      "Tối đa 30 phòng",
      "Tối đa 3 nhân viên",
      "Báo cáo doanh thu",
      "Hệ thống phản hồi đánh giá",
      "Hỗ trợ ưu tiên",
    ],
    limits: {
      boardingHouses: 5,
      rooms: 30,
      staff: 3,
    },
    popular: true,
    badge: "Most Popular",
    badgeVi: "Phổ biến nhất",
  },
  {
    key: "PREMIUM",
    name: "Premium",
    nameVi: "Cao cấp",
    subtitle: "For large-scale operations",
    subtitleVi: "Dành cho hoạt động quy mô lớn",
    monthlyPrice: 599000, // 599.000 VND
    monthlyPriceVND: 599000,
    yearlyPrice: 5990000, // 5.990.000 VND (tiết kiệm ~17%)
    yearlyPriceVND: 5990000,
    originalYearlyPrice: 7188000, // 7.188.000 VND
    originalYearlyPriceVND: 7188000,
    color: "#722ed1",
    gradient: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
    icon: <CrownOutlined />,
    features: [
      "Unlimited Boarding Houses",
      "Unlimited Rooms",
      "Unlimited Staff",
      "Advanced Analytics Dashboard",
      "Data Export (Excel, PDF, CSV)",
      "API Access",
      "Dedicated Support Team",
    ],
    featuresVi: [
      "Không giới hạn nhà trọ",
      "Không giới hạn phòng",
      "Không giới hạn nhân viên",
      "Bảng phân tích nâng cao",
      "Xuất dữ liệu (Excel, PDF, CSV)",
      "Truy cập API",
      "Đội ngũ hỗ trợ riêng",
    ],
    limits: {
      boardingHouses: Infinity,
      rooms: Infinity,
      staff: Infinity,
    },
    popular: false,
    badge: "Enterprise",
    badgeVi: "Doanh nghiệp",
  },
];

// Biến LIMITS để dễ dàng sử dụng trong các component khác
export const LIMITS = {
  FREE: { boardingHouses: 1, rooms: 5, staff: 0 },
  STANDARD: { boardingHouses: 5, rooms: 30, staff: 3 },
  PREMIUM: { boardingHouses: Infinity, rooms: Infinity, staff: Infinity },
};
