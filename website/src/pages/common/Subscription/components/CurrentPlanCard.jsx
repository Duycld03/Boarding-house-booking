import React from "react";
import { Card, Row, Col, Typography, Progress, Tag, Button, Alert } from "antd";
import {
  HomeOutlined,
  BuildOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { LIMITS } from "../data/plans";
import { useCurrentUser } from "@/context/userContext";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

// Tính số ngày còn lại của subscription
const calculateDaysRemaining = (endDate) => {
  if (!endDate) return 0;

  const today = moment().startOf("day"); // Lấy đầu ngày hiện tại để so sánh chính xác
  const end = moment(endDate).startOf("day"); // Lấy đầu ngày hết hạn để so sánh chính xác
  const daysRemaining = end.diff(today, "days");

  // Nếu ngày hiện tại là ngày hết hạn, trả về 0
  if (daysRemaining === 0) {
    return 0;
  }

  return daysRemaining > 0 ? daysRemaining : 0;
};

// Kiểm tra xem có đang trong grace period hay không
const isInGracePeriod = (subscription) => {
  if (!subscription || !subscription.endDate || !subscription.graceEndDate) {
    return false;
  }

  const today = moment().startOf("day"); // Lấy đầu ngày hiện tại
  const endDate = moment(subscription.endDate).startOf("day"); // Lấy đầu ngày hết hạn
  const graceEndDate = moment(subscription.graceEndDate).startOf("day"); // Lấy đầu ngày kết thúc grace period

  // Nếu hôm nay là ngày hết hạn, cũng tính là đang trong grace period
  if (today.isSame(endDate)) {
    return true;
  }

  // Chỉ trong grace period nếu đã qua ngày hết hạn nhưng chưa hết grace period
  return today.isAfter(endDate) && today.isBefore(graceEndDate);
};

// Kiểm tra xem có đã hết hạn hoàn toàn hay không (bao gồm grace period)
const isCompletelyExpired = (subscription) => {
  if (!subscription) return false;

  const today = moment().startOf("day"); // Lấy đầu ngày hiện tại

  // Nếu không có grace period, chỉ kiểm tra ngày hết hạn thông thường
  if (!subscription.graceEndDate) {
    if (!subscription.endDate) return false;

    const endDate = moment(subscription.endDate).startOf("day");

    // Nếu hôm nay là ngày hết hạn, chưa tính là hết hạn hoàn toàn
    if (today.isSame(endDate)) {
      return false;
    }

    return today.isAfter(endDate);
  }

  // Nếu có grace period, chỉ hoàn toàn hết hạn khi đã qua grace period
  const graceEndDate = moment(subscription.graceEndDate).startOf("day");

  // Nếu hôm nay là ngày kết thúc grace period, cũng tính là đã hết hạn hoàn toàn
  if (today.isSame(graceEndDate)) {
    return true;
  }

  return today.isAfter(graceEndDate);
};

// Lấy trạng thái hiển thị của subscription
const getSubscriptionStatus = (subscription, t) => {
  // Nếu không có subscription hoặc inactive, trả về inactive
  if (!subscription || !subscription.isActive) {
    return { text: t("currentPlan.status.inactive"), color: "error" };
  }

  // Nếu là gói Free, luôn trả về active
  if (subscription.plan === "FREE") {
    return { text: t("currentPlan.status.active"), color: "success" };
  }

  const today = moment().startOf("day");
  const daysRemaining = calculateDaysRemaining(subscription.endDate);
  const endDate = subscription.endDate
    ? moment(subscription.endDate).startOf("day")
    : null;

  // Kiểm tra đã hết hạn hoàn toàn
  if (isCompletelyExpired(subscription) || subscription.status === "EXPIRED") {
    return { text: t("currentPlan.status.expired"), color: "error" };
  }

  // Kiểm tra ngày hiện tại là ngày hết hạn
  if (endDate && today.isSame(endDate)) {
    return { text: t("currentPlan.status.expiringToday"), color: "warning" };
  }

  // Kiểm tra xem có đang trong grace period
  if (isInGracePeriod(subscription)) {
    return { text: t("currentPlan.status.gracePeriod"), color: "warning" };
  }

  // Nếu sắp hết hạn (còn <= 7 ngày) nhưng chưa hết hạn
  if (daysRemaining <= 7 && daysRemaining > 0) {
    return { text: t("currentPlan.status.expiringSoon"), color: "warning" };
  }

  // Mặc định là active
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

  // Điều chỉnh màu sắc theo chế độ sáng/tối
  const adjustedColor = darkMode
    ? lightenColor(color, 15) // Làm sáng màu trong dark mode
    : color;

  // Icon color và text color cũng nên điều chỉnh theo chế độ
  const iconColor = darkMode ? lightenColor(color, 20) : color;
  const textColor = darkMode ? "#e5e7eb" : "#1f2937";
  const valueColor = darkMode ? lightenColor(color, 10) : color;

  return (
    <div
      className={darkMode ? "usage-card dark" : "usage-card"}
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
      <div style={{ fontSize: "26px", marginBottom: "10px", color: iconColor }}>
        {icon}
      </div>
      <Progress
        type="dashboard"
        percent={percent}
        format={() => (
          <div>
            <div
              style={{ fontSize: "16px", fontWeight: "600", color: valueColor }}
            >
              {current}/{displayLimit}
            </div>
          </div>
        )}
        strokeColor={adjustedColor}
        trailColor={
          darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"
        }
        width={70}
      />
      <Text
        style={{
          fontSize: "13px",
          fontWeight: "500",
          marginTop: "6px",
          display: "block",
          color: textColor,
        }}
      >
        {title}
      </Text>
    </div>
  );
};

// Hàm để làm sáng màu cho dark mode
const lightenColor = (color, amount) => {
  // Nếu là màu hex
  if (color.startsWith("#")) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);

    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  // Nếu là màu RGB
  if (color.startsWith("rgb")) {
    return color;
  }

  // Màu được định nghĩa trước (red, green, ...)
  return color;
};

// Component thẻ gói hiện tại
const CurrentPlanCard = ({
  currentPlan,
  getProgressColor,
  getProgressPercent,
  subscription,
  darkMode,
  scrollToPricingPlans,
}) => {
  const { t } = useTranslation("subscription");
  const today = moment(); // Lấy ngày hiện tại để so sánh

  // Lấy thông tin resources từ user context
  const { user } = useCurrentUser();
  const resourceData = user?.resources || {
    rooms: 0,
    boardingHouses: 0,
    staff: 0,
  };

  // Xử lý trường hợp subscription là null hoặc undefined
  const safeSubscription = subscription || {
    plan: "FREE",
    isActive: true,
    endDate: null,
    graceEndDate: null,
    status: "ACTIVE",
  };

  // Xử lý dữ liệu từ API - đảm bảo daysRemaining được tính đúng
  const daysRemaining = calculateDaysRemaining(safeSubscription.endDate);

  // Kiểm tra các trạng thái đặc biệt
  const inGracePeriod = isInGracePeriod(safeSubscription);
  const completelyExpired =
    isCompletelyExpired(safeSubscription) ||
    safeSubscription.status === "EXPIRED";

  const subscriptionStatus = getSubscriptionStatus(safeSubscription, t);

  // Format hiển thị ngày hết hạn - kiểm tra để tránh lỗi với giá trị null/undefined
  const formattedEndDate = safeSubscription.endDate
    ? moment(safeSubscription.endDate).format("MMM DD, YYYY")
    : "-";

  // Format hiển thị ngày gia hạn - kiểm tra để tránh lỗi với giá trị null/undefined
  const formattedGraceEndDate = safeSubscription.graceEndDate
    ? moment(safeSubscription.graceEndDate).format("MMM DD, YYYY")
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

  // Hàm getProgressColor được điều chỉnh theo darkMode
  const getAdjustedProgressColor = (current, limit) => {
    const baseColor = getProgressColor(current, limit);
    return darkMode ? lightenColor(baseColor, 15) : baseColor;
  };

  // Kiểm tra xem subscription đã hết hạn hay đang trong grace period
  // Sửa logic này để đảm bảo chỉ hiển thị thông báo khi cần thiết
  const isExpiredOrGracePeriod =
    safeSubscription &&
    safeSubscription.plan !== "FREE" && // Gói Free không hiển thị cảnh báo
    (daysRemaining <= 7 || // Sắp hết hạn hoặc hết hạn
      inGracePeriod || // Đang trong grace period
      completelyExpired); // Đã hết hạn hoàn toàn

  // Sử dụng text thông báo phù hợp dựa trên tình trạng gói đăng ký
  const getAlertMessage = () => {
    const today = moment().startOf("day");
    const endDate = safeSubscription.endDate
      ? moment(safeSubscription.endDate).startOf("day")
      : null;

    if (completelyExpired) {
      return t("currentPlan.alert.expired");
    } else if (endDate && today.isSame(endDate)) {
      return t("currentPlan.alert.expiringToday");
    } else if (inGracePeriod) {
      return t("currentPlan.alert.gracePeriod");
    } else if (daysRemaining <= 7 && daysRemaining > 0) {
      return t("currentPlan.alert.expiringSoon", { days: daysRemaining });
    }
    return "";
  };

  // Xác định text hiển thị cho ngày/trạng thái gói
  const getSubscriptionTimeText = () => {
    if (safeSubscription.plan === "FREE") {
      // Gói FREE không hiển thị thông tin về thời hạn
      return null;
    }

    const today = moment().startOf("day");
    const endDate = safeSubscription.endDate
      ? moment(safeSubscription.endDate).startOf("day")
      : null;

    if (completelyExpired) {
      // Đã hết hạn hoàn toàn
      return t("currentPlan.expired");
    } else if (endDate && today.isSame(endDate)) {
      // Hôm nay là ngày hết hạn
      return t("currentPlan.expiringToday");
    } else if (inGracePeriod) {
      // Đang trong grace period
      return t("currentPlan.gracePeriod", { date: formattedGraceEndDate });
    } else if (daysRemaining > 0) {
      // Còn hạn sử dụng
      return t("currentPlan.daysRemaining", {
        days: daysRemaining,
        date: formattedEndDate,
      });
    } else {
      // Mặc định nếu không rơi vào các trường hợp trên
      return t("currentPlan.expired");
    }
  };

  return (
    <>
      {/* Thêm thông báo cảnh báo nếu gói đăng ký hết hạn */}
      {isExpiredOrGracePeriod && (
        <Alert
          message={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                padding: "8px 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <WarningOutlined
                  style={{
                    fontSize: "18px",
                    marginRight: "10px",
                    color: "#faad14",
                  }}
                />
                <span>{getAlertMessage()}</span>
              </div>
              <Button
                type="primary"
                danger={completelyExpired}
                onClick={scrollToPricingPlans}
                style={{
                  borderRadius: "8px",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                }}
              >
                {t("currentPlan.alert.renewNow")}
              </Button>
            </div>
          }
          type={completelyExpired ? "error" : "warning"}
          showIcon={false}
          style={{
            marginBottom: "20px",
            borderRadius: "12px",
            border: `1px solid ${
              completelyExpired ? "#ff4d4f30" : "#faad1430"
            }`,
            backgroundColor: darkMode
              ? completelyExpired
                ? "rgba(255, 77, 79, 0.1)"
                : "rgba(250, 173, 20, 0.1)"
              : completelyExpired
              ? "rgba(255, 77, 79, 0.06)"
              : "rgba(250, 173, 20, 0.06)",
          }}
        />
      )}

      <Card
        className={`subscription-card ${darkMode ? "dark-mode" : ""}`}
        style={{
          borderRadius: "16px",
          background: darkMode ? "rgb(31, 41, 55)" : "white",
          boxShadow: darkMode
            ? "0 6px 20px rgba(0, 0, 0, 0.25)"
            : "0 6px 20px rgba(0, 0, 0, 0.08)",
          border: `1.5px solid ${
            darkMode ? lightenColor(currentPlan.color, 10) : currentPlan.color
          }`,
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
                  color: darkMode
                    ? lightenColor(currentPlan.color, 15)
                    : currentPlan.color,
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
                  {safeSubscription && (
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
                {/* Chỉ hiển thị ngày còn lại cho các gói trả phí */}
                {safeSubscription && safeSubscription.plan !== "FREE" && (
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "13px",
                      color: darkMode ? "#d1d5db" : undefined,
                    }}
                  >
                    {getSubscriptionTimeText()}
                  </Text>
                )}
              </div>
            </div>
          </div>

          {/* Nút gia hạn - chỉ hiển thị cho gói trả phí và khi có điều kiện cần gia hạn */}
          {safeSubscription &&
            safeSubscription.plan !== "FREE" &&
            (daysRemaining <= 7 || inGracePeriod || completelyExpired) && (
              <div style={{ marginTop: "12px" }}>
                <Button
                  type="primary"
                  size="small"
                  onClick={scrollToPricingPlans}
                  style={{
                    background: darkMode
                      ? lightenColor(currentPlan.color, 15)
                      : currentPlan.color,
                    borderColor: darkMode
                      ? lightenColor(currentPlan.color, 15)
                      : currentPlan.color,
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
                    : getAdjustedProgressColor(
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
    </>
  );
};

export default CurrentPlanCard;
