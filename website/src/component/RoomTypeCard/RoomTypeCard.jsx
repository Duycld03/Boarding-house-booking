import { Modal, Card, Typography, Divider, Button } from "antd";
import formatAmount from "../../utils/formatAmount";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserAlt } from "@fortawesome/free-solid-svg-icons";
import CreateAppointmentForm from "../../pages/common/BoardingHouseDetail/CreateAppointmentForm";
import { useEffect, useState } from "react";
import { getRoomsByRoomType } from "../../api/room";
import { toast } from "react-toastify";
import { useCurrentUser } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import DepositPopup from "./DepositPopup";
import userRoles from "@/constants/userRole";
import { useTheme } from "@/context/ThemeContext"; // Import useTheme
import { useTranslation } from "react-i18next"; // Import useTranslation

const { Title, Paragraph, Text } = Typography;

const RoomCard = ({ roomData, boardingHouse }) => {
  const { isLogin, hasRole } = useCurrentUser();
  const isOwner = hasRole(userRoles.owner);
  const { darkMode } = useTheme(); // Sử dụng darkMode
  const { t } = useTranslation("boardingHouseDetail");

  const navigate = useNavigate();
  const [listRoomData, setListRoomData] = useState([]);
  const [depositPopupVisible, setDepositPopupVisible] = useState(false);

  const fetchRoomByRoomTypeId = async () => {
    try {
      const res = await getRoomsByRoomType(
        roomData?._id,
        roomData?.boardingHouseId?._id
      );
      if (res) {
        setListRoomData(res);
      }
    } catch (error) {
      toast.error(t("roomTypeCard.fetchError") + error.message);
    }
  };

  const handleOpen = () => {
    if (!isLogin) {
      Modal.confirm({
        title: t("roomTypeCard.loginRequired"),
        content: t("roomTypeCard.loginToDeposit"),
        okText: t("roomTypeCard.login"),
        cancelText: t("roomTypeCard.cancel"),
        onOk: () => navigate("/login"),
        // Thêm style cho Modal trong dark mode
        className: darkMode ? "ant-modal-dark" : "",
        // Thêm styles cho phần content và mask
        styles: darkMode
          ? {
              mask: { backgroundColor: "rgba(0, 0, 0, 0.65)" },
              content: {
                backgroundColor: "#1f2937",
                color: "#fff",
              },
            }
          : {},
      });
      return;
    }
    setDepositPopupVisible(true);
  };

  useEffect(() => {
    fetchRoomByRoomTypeId();
  }, []);

  return (
    <>
      <Card
        className={`sm:w-5/6 mx-auto mt-6 rounded-lg shadow-md ${
          darkMode ? "bg-gray-800 border-gray-700" : ""
        }`}
        hoverable
      >
        {/* image */}
        <div className="w-full flex flex-wrap gap-10">
          <img
            className="max-h-[400px] w-full xl:w-1/2 object-cover rounded-lg"
            src={roomData?.image?.imageUrl}
            alt={roomData?.typeName}
          />

          {/* content */}
          <div className="flex flex-1 gap-x-10 justify-evenly flex-col px-5">
            <Title
              level={3}
              className={`font-bold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
              style={{ color: darkMode ? "#fff" : "#000" }}
            >
              {roomData?.typeName}
            </Title>
            <Divider
              className={darkMode ? "border-gray-600" : "border-gray-500"}
            />
            <div className="flex justify-between">
              <Paragraph className="text-orange-500 font-semibold md:text-3xl">
                {formatAmount(roomData?.price)}/ {t("roomTypeCard.month")}
              </Paragraph>
              <Paragraph
                className={`flex gap-2 items-center md:text-2xl ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <Text
                  className={`font-semibold md:text-2xl ${
                    darkMode ? "text-gray-300" : ""
                  }`}
                >
                  {t("roomTypeCard.guests")}:
                </Text>
                <Text
                  className={`md:text-2xl ${darkMode ? "text-gray-300" : ""}`}
                >
                  {roomData?.peopleNumber}x
                </Text>
                <FontAwesomeIcon
                  icon={faUserAlt}
                  className={darkMode ? "text-gray-300" : ""}
                />
              </Paragraph>
            </div>

            <Paragraph
              className={`md:text-2xl ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <Text
                className={`font-semibold md:text-2xl ${
                  darkMode ? "text-gray-300" : ""
                }`}
              >
                {t("roomTypeCard.acreage")}:
              </Text>
              <Text
                className={`md:text-2xl ${darkMode ? "text-gray-300" : ""}`}
              >
                {roomData?.roomSize}m²
              </Text>
            </Paragraph>
            <Paragraph
              className={`md:text-2xl ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <Text
                className={`font-semibold md:text-2xl ${
                  darkMode ? "text-gray-300" : ""
                }`}
              >
                {t("roomTypeCard.furniture")}:
              </Text>
              <Text
                className={`md:text-2xl ${darkMode ? "text-gray-300" : ""}`}
              >
                {roomData?.facilities?.map((item) => item.name).join(", ")}
              </Text>
            </Paragraph>
            <Paragraph
              className={`md:text-2xl ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <Text
                className={`font-semibold md:text-2xl ${
                  darkMode ? "text-gray-300" : ""
                }`}
              >
                {t("roomTypeCard.availableRooms")}:
              </Text>
              <Text
                className={`md:text-2xl ${darkMode ? "text-gray-300" : ""}`}
              >
                {roomData?.availableRoom}
              </Text>
            </Paragraph>

            <Divider
              className={darkMode ? "border-gray-600" : "border-gray-500"}
            />

            <div className="flex justify-between mt-4">
              <Button
                className={`bg-primary text-white md:min-w-[200px] py-2 px-4 rounded-xl ${
                  darkMode && (isOwner || roomData?.availableRoom == 0)
                    ? "bg-gray-700 border-gray-600"
                    : ""
                }`}
                size="large"
                onClick={handleOpen}
                disabled={isOwner || roomData?.availableRoom == 0}
              >
                {t("roomTypeCard.deposit")}
              </Button>
              <CreateAppointmentForm
                listRoomData={listRoomData}
                ownerId={roomData?.boardingHouseId?.ownerId}
                darkMode={darkMode} // Truyền darkMode xuống component con
              />
            </div>
          </div>
        </div>
      </Card>
      <DepositPopup
        visible={depositPopupVisible}
        toggleVisible={setDepositPopupVisible}
        roomData={roomData}
        listRoomData={listRoomData}
        boardingHouse={boardingHouse}
        darkMode={darkMode} // Truyền darkMode xuống component con
      />

      {/* CSS toàn cục cho dark mode */}
      {darkMode && (
        <style jsx global>{`
          .ant-modal-dark .ant-modal-content {
            background-color: #1f2937;
            color: #e5e7eb;
          }

          .ant-modal-dark .ant-modal-header {
            background-color: #1f2937;
            border-bottom: 1px solid #374151;
          }

          .ant-modal-dark .ant-modal-title {
            color: #e5e7eb;
          }

          .ant-modal-dark .ant-modal-close {
            color: #e5e7eb;
          }

          .ant-modal-dark .ant-modal-footer {
            border-top: 1px solid #374151;
          }

          .ant-modal-dark .ant-btn-default {
            background-color: transparent;
            border-color: #374151;
            color: #e5e7eb;
          }

          .ant-modal-dark .ant-typography {
            color: #e5e7eb;
          }
        `}</style>
      )}
    </>
  );
};

export default RoomCard;
