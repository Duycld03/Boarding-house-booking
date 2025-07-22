import React from "react";
import { Card, Row, Col, Typography, Progress, Tag, Button } from "antd";
import { HomeOutlined, BuildOutlined, TeamOutlined } from "@ant-design/icons";
import moment from "moment";
import { LIMITS } from "../data/plans";
import { useCurrentUser } from "@/context/userContext";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

// Tính số ngày còn lại của subscription
const calculateDaysRemaining = (endDate) => {
  const today = moment();
  const end = moment(endDate);
  const daysRemaining = end.diff(today, "days");
  return daysRemaining >= 0 ? daysRemaining : 0;
};

// Lấy trạng thái hiển thị của subscription
const getSubscriptionStatus = (subscription, t) => {
  if (!subscription || !subscription.isActive)
    return { text: t("currentPlan.status.inactive"), color: "error" };

  const daysRemaining = calculateDaysRemaining(subscription.endDate);
  const graceEndDate = moment(subscription.graceEndDate);
  const today = moment();

  if (
    today.isAfter(moment(subscription.endDate)) &&
    today.isBefore(graceEndDate)
  ) {
    return { text: t("currentPlan.status.gracePeriod"), color: "warning" };
  }

  if (daysRemaining <= 7) {
    return { text: t("currentPlan.status.expiringSoon"), color: "warning" };
  }

  return { text: t("currentPlan.status.active"), color: "success" };
};

// Component để hiển thị thẻ sử dụng tài nguyên
const UsageProgressCard = ({
  title,
  current,
  limit,
  color,
  percent,
  icon,
  darkMode,
}) => {
  // Xử lý hiển thị đúng giới hạn
  const displayLimit = limit === Infinity ? "∞" : limit;

  return (
    <div
      className={darkMode ? "usage-card" : ""}
      style={{
        textAlign: "center",
        padding: "16px 12px",
        background: darkMode
          ? "linear-gradient(135deg, rgb(55, 65, 81) 0%, rgb(75, 85, 99) 100%)"
          : "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
        borderRadius: "12px",
        border: darkMode ? "1px solid rgb(75, 85, 99)" : "1px solid #f0f0f0",
      }}
    >
      <div style={{ fontSize: "26px", marginBottom: "10px", color }}>
        {icon}
      </div>
      <Progress
        type="dashboard"
        percent={percent}
        format={() => (
          <div>
            <div style={{ fontSize: "16px", fontWeight: "600", color }}>
              {current}/{displayLimit}
            </div>
          </div>
        )}
        strokeColor={color}
        width={70}
      />
      <Text
        style={{
          fontSize: "13px",
          fontWeight: "500",
          marginTop: "6px",
          display: "block",
          color: darkMode ? "#e5e7eb" : undefined,
        }}
      >
        {title}
      </Text>
    </div>
  );
};

// Component thẻ gói hiện tại
const CurrentPlanCard = ({
  currentPlan,
  getProgressColor,
  getProgressPercent,
  subscription,
  darkMode,
}) => {
  const { t } = useTranslation("subscription");

  // Lấy thông tin resources từ user context
  const { user } = useCurrentUser();
  const resourceData = user?.resources || {
    rooms: 0,
    boardingHouses: 0,
    staff: 0,
  };

  // Xử lý dữ liệu từ API
  const daysRemaining = subscription
    ? calculateDaysRemaining(subscription.endDate)
    : 0;
  const subscriptionStatus = subscription
    ? getSubscriptionStatus(subscription, t)
    : { text: t("currentPlan.status.noPlan"), color: "default" };

  // Format hiển thị ngày hết hạn
  const formattedEndDate = subscription?.endDate
    ? moment(subscription.endDate).format("MMM DD, YYYY")
    : "-";

  // Format hiển thị ngày gia hạn
  const formattedGraceEndDate = subscription?.graceEndDate
    ? moment(subscription.graceEndDate).format("MMM DD, YYYY")
    : "-";

  // Xử lý giới hạn theo loại plan
  const planKey = currentPlan?.key || "FREE";
  const planLimits = LIMITS[planKey] || LIMITS.FREE;

  // Tạo usage hiển thị dựa trên resources từ user và giới hạn của plan hiện tại
  const usage = {
    boardingHouses: {
      current: resourceData.boardingHouses || 0,
      limit: planLimits.boardingHouses,
    },
    rooms: {
      current: resourceData.rooms || 0,
      limit: planLimits.rooms,
    },
    staff: {
      current: resourceData.staff || 0,
      limit: planLimits.staff,
    },
  };

  // Kiểm tra xem người dùng có đang ở gói Premium không
  const isPremium = planKey === "PREMIUM";

  return (
    <Card
      className={`subscription-card ${darkMode ? "dark-mode" : ""}`}
      style={{
        borderRadius: "16px",
        background: darkMode ? "rgb(31, 41, 55)" : "white",
        boxShadow: darkMode
          ? "0 6px 20px rgba(0, 0, 0, 0.25)"
          : "0 6px 20px rgba(0, 0, 0, 0.08)",
        border: `1.5px solid ${currentPlan.color}`,
        overflow: "hidden",
        marginBottom: "30px",
      }}
    >
      <div
        style={{
          background: darkMode
            ? `linear-gradient(135deg, ${currentPlan.color}25 0%, ${currentPlan.color}15 100%)`
            : `linear-gradient(135deg, ${currentPlan.color}10 0%, ${currentPlan.color}03 100%)`,
          padding: "16px 20px",
          marginBottom: "16px",
          borderRadius: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                fontSize: "26px",
                color: currentPlan.color,
                marginRight: "12px",
              }}
            >
              {typeof currentPlan.icon === "function"
                ? currentPlan.icon()
                : currentPlan.icon}
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    color: darkMode ? "#f9fafb" : currentPlan.color,
                  }}
                >
                  {t("currentPlan.title")}: {currentPlan.name}
                </Title>
                {subscription && (
                  <Tag
                    color={subscriptionStatus.color}
                    style={{
                      fontSize: "11px",
                      padding: "0 8px",
                    }}
                  >
                    {subscriptionStatus.text}
                  </Tag>
                )}
              </div>
              {subscription && (
                <Text
                  type="secondary"
                  style={{
                    fontSize: "13px",
                    color: darkMode ? "#d1d5db" : undefined,
                  }}
                >
                  {daysRemaining > 0
                    ? t("currentPlan.daysRemaining", {
                        days: daysRemaining,
                        date: formattedEndDate,
                      })
                    : subscription.status === "ACTIVE"
                    ? t("currentPlan.gracePeriod", {
                        date: formattedGraceEndDate,
                      })
                    : t("currentPlan.expired")}
                </Text>
              )}
            </div>
          </div>
        </div>

        {/* Nút gia hạn */}
        {subscription &&
          (daysRemaining <= 7 ||
            moment().isAfter(moment(subscription.endDate))) && (
            <div style={{ marginTop: "12px" }}>
              <Button
                type="primary"
                size="small"
                style={{
                  background: currentPlan.color,
                  borderColor: currentPlan.color,
                  fontSize: "12px",
                }}
              >
                {t("currentPlan.renewButton")}
              </Button>
            </div>
          )}
      </div>

      {/* Grid hiển thị tài nguyên */}
      <Row gutter={[16, 16]}>
        {[
          {
            key: "boardingHouses",
            title: t("resources.boardingHouses"),
            icon: <HomeOutlined />,
          },
          {
            key: "rooms",
            title: t("resources.rooms"),
            icon: <BuildOutlined />,
          },
          {
            key: "staff",
            title: t("resources.staff"),
            icon: <TeamOutlined />,
          },
        ].map((item) => (
          <Col xs={24} sm={8} key={item.key}>
            <UsageProgressCard
              title={item.title}
              current={usage[item.key].current}
              limit={usage[item.key].limit}
              color={
                isPremium && item.key !== "staff"
                  ? currentPlan.color
                  : getProgressColor(
                      usage[item.key].current,
                      usage[item.key].limit
                    )
              }
              percent={
                isPremium
                  ? item.key === "staff" && usage[item.key].current === 0
                    ? 0
                    : 50
                  : getProgressPercent(
                      usage[item.key].current,
                      usage[item.key].limit
                    )
              }
              icon={item.icon}
              darkMode={darkMode}
            />
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default CurrentPlanCard;
