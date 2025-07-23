import React from "react";
import "./SubscriptionModals.css";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import {
  faClock,
  faTriangleExclamation,
  faHouse,
  faDoorOpen,
  faUsers,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";
import { faLightbulb } from "@fortawesome/free-regular-svg-icons";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const { darkMode } = useTheme();

  return (
    <div
      className={`fixed inset-0 ${
        darkMode ? "bg-black/70" : "bg-black/60"
      } backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300`}
      onClick={onClose}
    >
      <div
        className={`${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        } rounded-2xl shadow-2xl max-w-xl w-full mx-4 transform transition-all duration-300 animate-in zoom-in-95`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

// Modal cho grace period (còn trong thời gian gia hạn)
export const GracePeriodModal = ({
  isOpen,
  onClose,
  graceDaysRemaining,
  onUpgrade,
  onContinue,
}) => {
  // Sử dụng namespace common.subscription
  const { t } = useTranslation("common", { keyPrefix: "subscription" });
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const getThemeClasses = (light, dark) => (darkMode ? dark : light);

  const handleUpgrade = () => {
    // Đóng modal trước
    onClose();

    // Nếu có callback onUpgrade được truyền vào, gọi nó
    if (typeof onUpgrade === "function") {
      onUpgrade();
    } else {
      // Mặc định chuyển hướng đến trang subscription
      navigate("/subscription");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-10 text-center">
        <div className="mb-8">
          <div
            className={`mx-auto flex items-center justify-center h-28 w-28 rounded-full ${getThemeClasses(
              "bg-gradient-to-br from-yellow-100 to-orange-100",
              "bg-gradient-to-br from-yellow-900/30 to-orange-800/30"
            )} shadow-lg`}
          >
            <FontAwesomeIcon
              icon={faClock}
              className={`text-5xl ${getThemeClasses(
                "text-yellow-600",
                "text-yellow-500"
              )}`}
            />
          </div>
        </div>

        <h3
          className={`text-3xl font-bold ${getThemeClasses(
            "text-gray-900",
            "text-gray-100"
          )} mb-4`}
        >
          {t("modal.gracePeriod.title", "Gói đăng ký đã hết hạn")}
        </h3>

        <div
          className={`${getThemeClasses(
            "bg-yellow-50 border-yellow-200",
            "bg-yellow-900/20 border-yellow-700/30"
          )} rounded-xl p-6 mb-8 border`}
        >
          <p
            className={`${getThemeClasses(
              "text-gray-700",
              "text-gray-300"
            )} mb-3 text-xl`}
          >
            {t("modal.gracePeriod.message", "Gói đăng ký của bạn đã hết hạn")}
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div
              className={`${getThemeClasses(
                "bg-yellow-500 text-white",
                "bg-yellow-600 text-gray-100"
              )} px-4 py-2 rounded-full text-lg font-semibold`}
            >
              {graceDaysRemaining} {t("modal.gracePeriod.days", "ngày")}
            </div>
            <span
              className={`${getThemeClasses(
                "text-gray-600",
                "text-gray-300"
              )} text-xl`}
            >
              {t("modal.gracePeriod.daysRemaining", "còn lại để gia hạn")}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleUpgrade}
            className={`flex-1 ${getThemeClasses(
              "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800",
              "bg-gradient-to-r from-blue-700 to-blue-800 text-white hover:from-blue-800 hover:to-blue-900"
            )} px-6 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg text-xl`}
          >
            <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
            {t("modal.gracePeriod.upgradeNow", "Gia hạn ngay")}
          </button>
          <button
            onClick={() => {
              onClose();
              if (onContinue) onContinue();
            }}
            className={`flex-1 ${getThemeClasses(
              "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
              "bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600"
            )} px-6 py-4 rounded-xl font-semibold transition-colors border text-xl`}
          >
            {t("modal.gracePeriod.later", "Để sau")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Modal cho trường hợp đã hết hạn hoàn toàn
export const ExpiredModal = ({ isOpen, onClose, onUpgrade, onContinue }) => {
  // Sử dụng namespace common.subscription
  const { t } = useTranslation("common", { keyPrefix: "subscription" });
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const getThemeClasses = (light, dark) => (darkMode ? dark : light);

  const handleUpgrade = () => {
    // Đóng modal trước
    onClose();

    // Nếu có callback onUpgrade được truyền vào, gọi nó
    if (typeof onUpgrade === "function") {
      onUpgrade();
    } else {
      // Mặc định chuyển hướng đến trang subscription
      navigate("/subscription");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-10 text-center">
        <div className="mb-8">
          <div
            className={`mx-auto flex items-center justify-center h-28 w-28 rounded-full ${getThemeClasses(
              "bg-gradient-to-br from-red-100 to-pink-100",
              "bg-gradient-to-br from-red-900/30 to-pink-800/30"
            )} shadow-lg`}
          >
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className={`text-5xl ${getThemeClasses(
                "text-red-600",
                "text-red-500"
              )}`}
            />
          </div>
        </div>

        <h3
          className={`text-3xl font-bold ${getThemeClasses(
            "text-gray-900",
            "text-gray-100"
          )} mb-4`}
        >
          {t("modal.expired.title", "Tính năng bị giới hạn")}
        </h3>

        <div
          className={`${getThemeClasses(
            "bg-red-50 border-red-200",
            "bg-red-900/20 border-red-700/30"
          )} rounded-xl p-6 mb-8 border`}
        >
          <p
            className={`${getThemeClasses(
              "text-gray-700",
              "text-gray-300"
            )} text-xl`}
          >
            {t(
              "modal.expired.message",
              "Gói đăng ký của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng tính năng này."
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleUpgrade}
            className={`flex-1 ${getThemeClasses(
              "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800",
              "bg-gradient-to-r from-red-700 to-red-800 text-white hover:from-red-800 hover:to-red-900"
            )} px-6 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg text-xl`}
          >
            <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
            {t("modal.expired.upgradeNow", "Gia hạn ngay")}
          </button>
          <button
            onClick={() => {
              onClose();
            }}
            className={`flex-1 ${getThemeClasses(
              "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
              "bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600"
            )} px-6 py-4 rounded-xl font-semibold transition-colors border text-xl`}
          >
            {t("modal.expired.cancel", "Dừng lại")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Modal cho trường hợp vượt quá giới hạn (nhưng vẫn còn hạn)
export const LimitExceededModal = ({
  isOpen,
  onClose,
  limitType,
  currentCount,
  maxLimit,
  onUpgrade,
}) => {
  // Sử dụng namespace common.subscription
  const { t } = useTranslation("common", { keyPrefix: "subscription" });
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const getThemeClasses = (light, dark) => (darkMode ? dark : light);

  const handleUpgrade = () => {
    // Đóng modal trước
    onClose();

    // Nếu có callback onUpgrade được truyền vào, gọi nó
    if (typeof onUpgrade === "function") {
      onUpgrade();
    } else {
      // Mặc định chuyển hướng đến trang subscription
      navigate("/subscription");
    }
  };

  const getLimitTypeName = (type) => {
    switch (type) {
      case "boardingHouses":
        return t("limitTypes.boardingHouses", "nhà trọ");
      case "rooms":
        return t("limitTypes.rooms", "phòng");
      case "staff":
        return t("limitTypes.staff", "nhân viên");
      default:
        return type;
    }
  };

  const getLimitIcon = (type) => {
    switch (type) {
      case "boardingHouses":
        return faHouse;
      case "rooms":
        return faDoorOpen;
      case "staff":
        return faUsers;
      default:
        return faChartSimple;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-10 text-center">
        <div className="mb-8">
          <div
            className={`mx-auto flex items-center justify-center h-28 w-28 rounded-full ${getThemeClasses(
              "bg-gradient-to-br from-orange-100 to-amber-100",
              "bg-gradient-to-br from-orange-900/30 to-amber-800/30"
            )} shadow-lg`}
          >
            <FontAwesomeIcon
              icon={getLimitIcon(limitType)}
              className={`text-5xl ${getThemeClasses(
                "text-orange-600",
                "text-orange-500"
              )}`}
            />
          </div>
        </div>

        <h3
          className={`text-3xl font-bold ${getThemeClasses(
            "text-gray-900",
            "text-gray-100"
          )} mb-4`}
        >
          {t("modal.limitExceeded.title", "Đã đạt giới hạn gói đăng ký")}
        </h3>

        <div
          className={`${getThemeClasses(
            "bg-orange-50 border-orange-200",
            "bg-orange-900/20 border-orange-700/30"
          )} rounded-xl p-6 mb-8 border`}
        >
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div
              className={`${getThemeClasses(
                "bg-orange-500 text-white",
                "bg-orange-600 text-gray-100"
              )} px-4 py-2 rounded-full text-lg font-semibold`}
            >
              {currentCount}/{maxLimit === Infinity ? "∞" : maxLimit}
            </div>
            <span
              className={`${getThemeClasses(
                "text-gray-700",
                "text-gray-300"
              )} font-medium text-xl`}
            >
              {getLimitTypeName(limitType)}
            </span>
          </div>
          <p
            className={`${getThemeClasses(
              "text-gray-600",
              "text-gray-400"
            )} text-lg`}
          >
            {t(
              "modal.limitExceeded.message",
              "Bạn đã sử dụng hết giới hạn của gói hiện tại"
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleUpgrade}
            className={`flex-1 ${getThemeClasses(
              "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800",
              "bg-gradient-to-r from-blue-700 to-blue-800 text-white hover:from-blue-800 hover:to-blue-900"
            )} px-6 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg text-xl`}
          >
            <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
            {t("modal.limitExceeded.upgrade", "Nâng cấp gói")}
          </button>
          <button
            onClick={onClose}
            className={`flex-1 ${getThemeClasses(
              "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
              "bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600"
            )} px-6 py-4 rounded-xl font-semibold transition-colors border text-xl`}
          >
            {t("modal.limitExceeded.cancel", "Hủy")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Demo component để test các modal
export default function ModalDemo() {
  const [activeModal, setActiveModal] = React.useState(null);
  // Sử dụng namespace common.subscription
  const { t } = useTranslation("common", { keyPrefix: "subscription" });
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} p-8`}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1
            className={`text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            } text-center`}
          >
            {t("demo.title", "Modal Components Demo")}
          </h1>
          <button
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded-lg ${
              darkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {darkMode ? "🌞 Light" : "🌙 Dark"}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => setActiveModal("grace")}
            className="bg-yellow-500 text-white px-6 py-4 rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
          >
            <FontAwesomeIcon icon={faClock} className="mr-2" />
            {t("demo.gracePeriod", "Grace Period Modal")}
          </button>

          <button
            onClick={() => setActiveModal("expired")}
            className="bg-red-500 text-white px-6 py-4 rounded-xl font-semibold hover:bg-red-600 transition-colors"
          >
            <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2" />
            {t("demo.expired", "Expired Modal")}
          </button>

          <button
            onClick={() => setActiveModal("limit")}
            className="bg-orange-500 text-white px-6 py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            <FontAwesomeIcon icon={faChartSimple} className="mr-2" />
            {t("demo.limitExceeded", "Limit Exceeded Modal")}
          </button>
        </div>
      </div>

      <GracePeriodModal
        isOpen={activeModal === "grace"}
        onClose={() => setActiveModal(null)}
        graceDaysRemaining={7}
        onUpgrade={() =>
          alert(t("alerts.upgradeSelected", "Nâng cấp được chọn!"))
        }
        onContinue={() =>
          alert(t("alerts.continueSelected", "Tiếp tục được chọn!"))
        }
      />

      <ExpiredModal
        isOpen={activeModal === "expired"}
        onClose={() => setActiveModal(null)}
        onUpgrade={() =>
          alert(t("alerts.upgradeSelected", "Gia hạn được chọn!"))
        }
        onContinue={() =>
          alert(t("alerts.continueSelected", "Tiếp tục được chọn!"))
        }
      />

      <LimitExceededModal
        isOpen={activeModal === "limit"}
        onClose={() => setActiveModal(null)}
        limitType="boardingHouses"
        currentCount={5}
        maxLimit={5}
        onUpgrade={() =>
          alert(t("alerts.upgradeSelected", "Nâng cấp được chọn!"))
        }
      />
    </div>
  );
}
