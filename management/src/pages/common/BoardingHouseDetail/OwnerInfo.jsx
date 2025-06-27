import { Card, Avatar, Modal, Tag, Tooltip } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

function OwnerInfo({ ownerData }) {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation("boardingHouseDetail");
  const { darkMode } = useTheme();

  if (!ownerData) return null;

  // Define theme styles
  const modalTitleStyle = {
    color: darkMode ? "#ffffff" : "#000000",
  };

  const modalBodyStyle = {
    backgroundColor: darkMode ? "#1f1f1f" : "#ffffff",
    color: darkMode ? "#ffffff" : "#000000",
  };

  const tooltipStyle = {
    backgroundColor: darkMode ? "#333333" : "#ffffff",
    color: darkMode ? "#ffffff" : "#000000",
  };

  const nameStyle = {
    color: darkMode ? "#ffffff" : "#000000",
  };

  return (
    <>
      <Tooltip
        placement="bottom"
        title={t("ownerInfo.tooltip")}
        color={darkMode ? "#333333" : "#ffffff"}
        overlayInnerStyle={tooltipStyle}
      >
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => setVisible(true)}
        >
          <Avatar
            size={48}
            src={ownerData.avatarImage?.url}
            alt={t("ownerInfo.avatarAlt")}
          />
          <span className="text-3xl font-semibold" style={nameStyle}>
            {ownerData.fullname}
          </span>
        </div>
      </Tooltip>

      <Modal
        title={
          <span
            className="text-lg sm:text-4xl font-bold"
            style={modalTitleStyle}
          >
            {t("ownerInfo.title")}
          </span>
        }
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={400}
        className={darkMode ? "dark-modal" : ""}
      >
        <div className="flex flex-col">
          <Avatar
            className="mx-auto"
            size={96}
            src={ownerData.avatarImage?.url}
            alt={t("ownerInfo.avatarAlt")}
          />
          <div className="mt-3 space-y-2">
            <p>
              <strong>{t("ownerInfo.fullName")}:</strong>
              <Tag color="blue">{ownerData.fullname}</Tag>
            </p>
            <p>
              <strong>{t("ownerInfo.email")}:</strong>
              <Tag color="green">{ownerData.email}</Tag>
            </p>
            <p>
              <strong>{t("ownerInfo.phone")}:</strong>
              <Tag color="purple">{ownerData.phoneNumber}</Tag>
            </p>
            <p>
              <strong>{t("ownerInfo.gender")}:</strong>
              <Tag color="red">
                {t(`gender.${ownerData.gender.toLowerCase()}`)}
              </Tag>
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default OwnerInfo;
