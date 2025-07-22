import React, { useState, useEffect } from "react";
import { Card, Button, Switch, Row, Col, Typography, Tag } from "antd";
import { CrownOutlined } from "@ant-design/icons";

import PricingPlans from "./components/PricingPlans";
import CurrentPlanCard from "./components/CurrentPlanCard";
import PaymentModal from "./components/PaymentModal";
import { plans } from "./data/plans";
import { useCurrentUser } from "@/context/userContext";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import "./SubscriptionPage.css";
import i18n from "@/config-translation/config-translation";

const { Title, Text, Paragraph } = Typography;

const SubscriptionPage = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentPlan, setCurrentPlan] = useState("FREE");
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation("subscription");
  const { darkMode } = useTheme();

  const { user } = useCurrentUser();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);

        setSubscription(user?.subscription || null);
        setCurrentPlan(user?.subscription?.plan || "FREE");
      } catch (error) {
        console.error("Error fetching subscription data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const getProgressColor = (current, limit) => {
    if (limit === 0) return "#ff4d4f";
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return "#ff4d4f";
    if (percentage >= 70) return "#faad14";
    return "#52c41a";
  };

  const getProgressPercent = (current, limit) => {
    if (limit === 0) return 100;
    return Math.min((current / limit) * 100, 100);
  };

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const currentPlanObject =
    plans.find((plan) => plan.key === currentPlan) || plans[0];

  // Get localized plans data
  const localizedPlans = plans.map((plan) => {
    const key = plan.key.toLowerCase();
    return {
      ...plan,
      name: t(`plans.${key}.name`),
      subtitle: t(`plans.${key}.subtitle`),
      features: t(`plans.${key}.features`, { returnObjects: true }),
      badge: plan.badge
        ? t(`pricing.badges.${plan.badge.toLowerCase().replace(" ", "")}`)
        : null,
    };
  });

  return (
    <div
      className={`subscription-container ${darkMode ? "dark-mode" : ""}`}
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "40px 24px",
        background: darkMode ? "rgb(31 41 55)" : "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      {/* Hero Section */}
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <div
          className="subscription-hero"
          style={{
            background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
            borderRadius: "20px",
            padding: "40px",
            border: "none",
            boxShadow: "0 10px 30px rgba(108, 92, 231, 0.2)",
          }}
        >
          <Title
            level={1}
            style={{
              fontSize: "3.5rem",
              marginBottom: "16px",
              color: "white",
              fontWeight: "700",
            }}
          >
            <CrownOutlined style={{ marginRight: "16px", color: "#ffd700" }} />
            {t("pageTitle")}
          </Title>
          <Paragraph
            style={{
              fontSize: "20px",
              color: "rgba(255, 255, 255, 0.95)",
              marginBottom: "30px",
              maxWidth: "600px",
              margin: "0 auto 30px",
            }}
          >
            {t("pageDescription")}
          </Paragraph>

          {/* Billing Toggle */}
          <div
            className="billing-toggle"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "16px",
              padding: "12px 24px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "50px",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: "16px",
                fontWeight: billingCycle === "monthly" ? "600" : "400",
              }}
            >
              {t("billing.monthly")}
            </Text>
            <Switch
              checked={billingCycle === "yearly"}
              onChange={(checked) =>
                setBillingCycle(checked ? "yearly" : "monthly")
              }
              style={{
                background:
                  billingCycle === "yearly"
                    ? "#ffd700"
                    : "rgba(255, 255, 255, 0.3)",
              }}
            />
            <Text
              style={{
                color: "white",
                fontSize: "16px",
                fontWeight: billingCycle === "yearly" ? "600" : "400",
              }}
            >
              {t("billing.yearly")}
              <Tag
                color="gold"
                style={{ marginLeft: "8px", fontWeight: "600" }}
              >
                {t("billing.saveLabel")}
              </Tag>
            </Text>
          </div>
        </div>
      </div>

      <div>
        {/* Current Plan Status */}
        <CurrentPlanCard
          currentPlan={currentPlanObject}
          getProgressColor={getProgressColor}
          getProgressPercent={getProgressPercent}
          subscription={subscription}
          darkMode={darkMode}
        />

        {/* Pricing Plans */}
        <PricingPlans
          plans={localizedPlans}
          currentPlan={currentPlan}
          billingCycle={billingCycle}
          handleUpgrade={handleUpgrade}
          hoveredCard={hoveredCard}
          setHoveredCard={setHoveredCard}
          darkMode={darkMode}
        />
      </div>

      {/* Payment Modal */}
      <PaymentModal
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        selectedPlan={selectedPlan}
        billingCycle={billingCycle}
        darkMode={darkMode}
      />
    </div>
  );
};

export default SubscriptionPage;
