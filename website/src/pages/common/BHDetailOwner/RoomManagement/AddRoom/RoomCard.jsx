import React from "react";
import { Card, Typography, Alert, Checkbox, Tooltip } from "antd";
import { Button } from "@/component";
import {
  EditOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useTheme } from "@/context/ThemeContext";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

function RoomCard({
  room,
  roomTypes,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  showCheckbox = true,
  disabled = false,
}) {
  const { darkMode } = useTheme();
  const { t } = useTranslation("bhManagement");

  const getCardClasses = () => {
    const baseClasses = darkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200";

    return `${baseClasses} ${room.hasError ? "border-red-500" : ""}`;
  };

  // Tìm loại phòng
  const roomType = roomTypes.find((t) => t._id === room.roomTypeId);

  // Render card header
  const renderCardTitle = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Text strong className={darkMode ? "text-white" : ""}>
          {t("roomManagement.table.roomNumber")} {room.roomNumber}
        </Text>
        {room.hasError && (
          <Tooltip title={room.errorMessage}>
            <ExclamationCircleOutlined className="text-red-500 ml-2" />
          </Tooltip>
        )}
      </div>
    </div>
  );

  // Rút gọn phần hiển thị thông tin phòng
  const renderRoomDetails = () => {
    return (
      <div className="flex flex-col space-y-1">
        {/* Hiển thị tầng và loại phòng trên cùng một dòng */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Text
              type={darkMode ? "secondary" : "secondary"}
              className={darkMode ? "text-gray-400" : ""}
            >
              {t("roomManagement.addRoom.floor")}:
            </Text>
            <Text className={`ml-1 ${darkMode ? "text-gray-200" : ""}`}>
              {room.floor || "N/A"}
            </Text>
          </div>
          <div>
            {roomType ? (
              <Tooltip title={roomType.typeName}>
                <div className="px-2 py-1 rounded-full text-lg font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {roomType.typeName.length > 15
                    ? roomType.typeName.substring(0, 15) + "..."
                    : roomType.typeName}
                </div>
              </Tooltip>
            ) : (
              <div className="px-2 py-1 rounded-full text-lg font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                {t("roomManagement.common.unknown")}
              </div>
            )}
          </div>
        </div>

        {/* Mô tả rút gọn */}
        {room.description && (
          <Tooltip title={room.description}>
            <div className="flex items-start">
              <InfoCircleOutlined
                className={`mr-1 mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <Text
                ellipsis={{ tooltip: room.description }}
                className={`${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } text-lg`}
              >
                {room.description}
              </Text>
            </div>
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <Card
      className={`relative border hover:border-blue-400 transition-all duration-200 ${
        room.hasError ? "border-red-500" : getBorderColorClass()
      } ${isSelected ? (darkMode ? "bg-blue-900/20" : "bg-blue-50") : ""}`}
      size="small"
      title={renderCardTitle()}
      headStyle={
        darkMode
          ? { backgroundColor: "#1f2937", borderBottomColor: "#374151" }
          : {}
      }
      bodyStyle={{
        backgroundColor: darkMode ? "#1f2937" : "",
        padding: "12px", // Giảm padding để card nhỏ hơn
      }}
    >
      {room.hasError && (
        <Alert
          message={room.errorMessage}
          type="error"
          size="small"
          className="mb-2"
        />
      )}

      {renderRoomDetails()}

      {/* Actions - Giữ chỉ một bộ action ở footer */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        {showCheckbox && (
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            disabled={disabled}
            className={darkMode ? "text-gray-300" : ""}
          >
            <span className="text-lg">
              {isSelected
                ? t("roomManagement.common.selected", "Selected")
                : t("roomManagement.common.select", "Select")}
            </span>
          </Checkbox>
        )}

        {/* Cải thiện style của buttons */}
        <div className="flex items-center space-x-2">
          {onDelete && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={onDelete}
              disabled={disabled}
              size="small"
              className={`flex items-center justify-center ${
                darkMode ? "hover:text-red-400" : "hover:bg-red-50"
              }`}
            >
              <span className="text-xs ml-1 hidden sm:inline">
                {t("roomManagement.common.delete", "Delete")}
              </span>
            </Button>
          )}
          <Button
            icon={<EditOutlined />}
            onClick={onEdit}
            disabled={disabled}
            color="red"
            size="small"
          >
            <span className="text-xs ml-1">{t("common.edit", "Edit")}</span>
          </Button>
        </div>
      </div>
    </Card>
  );

  function getBorderColorClass() {
    return darkMode ? "border-gray-700" : "border-gray-200";
  }
}

RoomCard.propTypes = {
  room: PropTypes.object.isRequired,
  roomTypes: PropTypes.array.isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  showCheckbox: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default RoomCard;
