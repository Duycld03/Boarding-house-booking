import React from "react";
import { Card, Button, Row, Col, Typography, List, Space } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";

const { Title, Text } = Typography;

const PricingPlans = ({
  plans,
  currentPlan,
  billingCycle,
  handleUpgrade,
  hoveredCard,
  setHoveredCard,
}) => {
  return (
    <Row gutter={[24, 24]} style={{ marginTop: "40px" }}>
      {plans.map((plan) => {
        const PlanIcon = plan.icon;

        return (
          <Col xs={24} lg={8} key={plan.key}>
            <div
              style={{
                height: "100%",
                transform:
                  hoveredCard === plan.key
                    ? "translateY(-8px) scale(1.02)"
                    : "translateY(0) scale(1)",
                transition: "all 0.3s ease",
                position: "relative",
              }}
              onMouseEnter={() => setHoveredCard(plan.key)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card
                style={{
                  height: "100%",
                  borderRadius: "16px",
                  border:
                    currentPlan === plan.key
                      ? `2px solid ${plan.color}`
                      : "1px solid #f0f0f0",
                  boxShadow:
                    hoveredCard === plan.key
                      ? "0 16px 32px rgba(0, 0, 0, 0.15)"
                      : "0 6px 16px rgba(0, 0, 0, 0.08)",
                  background: "white",
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
                bodyStyle={{
                  padding: "0",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: "15px",
                      right: "-28px",
                      background: plan.gradient,
                      color: "white",
                      padding: "6px 35px",
                      fontSize: "11px",
                      fontWeight: "600",
                      transform: "rotate(45deg)",
                      zIndex: 10,
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div
                  style={{
                    background: plan.gradient,
                    padding: "30px 24px",
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                    {typeof PlanIcon === "function" ? <PlanIcon /> : PlanIcon}
                  </div>
                  <Title
                    level={3}
                    style={{ color: "white", margin: "0 0 6px 0" }}
                  >
                    {plan.name}
                  </Title>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.9)",
                      fontSize: "14px",
                    }}
                  >
                    {plan.subtitle}
                  </Text>
                </div>

                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div style={{ marginBottom: "12px" }}>
                    <span
                      style={{
                        fontSize: "40px",
                        fontWeight: "700",
                        color: "#1a1a1a",
                      }}
                    >
                      {plan.monthlyPrice > 0 && "$"}
                      {billingCycle === "monthly"
                        ? plan.monthlyPrice
                        : plan.yearlyPrice}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <Text
                        type="secondary"
                        style={{ fontSize: "16px", marginLeft: "6px" }}
                      >
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </Text>
                    )}
                  </div>

                  {billingCycle === "yearly" && plan.monthlyPrice > 0 && (
                    <div>
                      <Text
                        style={{
                          fontSize: "14px",
                          color: "#52c41a",
                          fontWeight: "600",
                        }}
                      >
                        Save ${plan.originalYearlyPrice - plan.yearlyPrice} per
                        year
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        ${Math.round(plan.yearlyPrice / 12)}/month when billed
                        annually
                      </Text>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }}
                >
                  <div
                    style={{
                      padding: "24px 24px 0",
                      flexGrow: 1,
                    }}
                  >
                    <List
                      dataSource={plan.features}
                      renderItem={(feature) => (
                        <List.Item
                          style={{ padding: "10px 0", border: "none" }}
                        >
                          <Space align="start">
                            <CheckCircleFilled
                              style={{
                                color: plan.color,
                                fontSize: "14px",
                                marginTop: "2px",
                              }}
                            />
                            <Text style={{ fontSize: "14px" }}>{feature}</Text>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </div>

                  <div style={{ padding: "24px", marginTop: "auto" }}>
                    {currentPlan === plan.key ? (
                      <Button
                        size="large"
                        block
                        disabled
                        style={{
                          height: "48px",
                          borderRadius: "10px",
                          fontSize: "15px",
                          fontWeight: "600",
                        }}
                      >
                        <CheckCircleFilled /> Current Plan
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        block
                        onClick={() => handleUpgrade(plan)}
                        style={{
                          height: "48px",
                          background: plan.gradient,
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "15px",
                          fontWeight: "600",
                          boxShadow: `0 4px 12px ${plan.color}40`,
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = `0 6px 20px ${plan.color}60`;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = `0 4px 12px ${plan.color}40`;
                        }}
                      >
                        {plan.key === "FREE"
                          ? "Get Started"
                          : `Upgrade to ${plan.name}`}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        );
      })}
    </Row>
  );
};

export default PricingPlans;
