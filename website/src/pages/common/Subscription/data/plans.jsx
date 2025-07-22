import React from "react";
import { HomeOutlined, RocketOutlined, CrownOutlined } from "@ant-design/icons";

export const plans = [
  {
    key: "FREE",
    name: "Free",
    subtitle: "Perfect for getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    originalYearlyPrice: 0,
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
    limits: {
      boardingHouses: 1,
      rooms: 5,
      staff: 0,
    },
    popular: false,
    badge: null,
  },
  {
    key: "STANDARD",
    name: "Standard",
    subtitle: "Best for growing businesses",
    monthlyPrice: 299,
    yearlyPrice: 3299,
    originalYearlyPrice: 3588,
    color: "#1890ff",
    gradient: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
    icon: <RocketOutlined />,
    features: [
      "Up to 5 Boarding Houses",
      "Up to 30 Rooms",
      "Up to 3 Staff Members",
      "Revenue Reports",
    ],
    limits: {
      boardingHouses: 5,
      rooms: 30,
      staff: 3,
    },
    popular: true,
    badge: "Most Popular",
  },
  {
    key: "PREMIUM",
    name: "Premium",
    subtitle: "For large-scale operations",
    monthlyPrice: 599,
    yearlyPrice: 6589,
    originalYearlyPrice: 7188,
    color: "#722ed1",
    gradient: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
    icon: <CrownOutlined />,
    features: [
      "Unlimited Boarding Houses",
      "Unlimited Rooms",
      "Unlimited Staff",

      "API Access",
      "Dedicated Support Team",
    ],
    limits: {
      boardingHouses: Infinity,
      rooms: Infinity,
      staff: Infinity,
    },
    popular: false,
    badge: "Enterprise",
  },
];

// Biến LIMITS để dễ dàng sử dụng trong các component khác
export const LIMITS = {
  FREE: { boardingHouses: 1, rooms: 5, staff: 0 },
  STANDARD: { boardingHouses: 5, rooms: 30, staff: 3 },
  PREMIUM: { boardingHouses: Infinity, rooms: Infinity, staff: Infinity },
};
