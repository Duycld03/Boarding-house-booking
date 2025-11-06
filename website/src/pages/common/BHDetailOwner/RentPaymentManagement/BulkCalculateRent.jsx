import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Select,
  Spin,
  Checkbox,
  Table,
  Empty,
  Alert,
  Progress,
} from "antd";
import { getAvailableRooms } from "@/api/ownerUser/roomAPI";
import { toast } from "react-toastify";
import { getElectricalAndWaterPrice } from "@/api/ownerUser/boardingHouseAPI";
import { calculateBulkMonthlyBill } from "@/api/ownerUser/paymentBillAPI";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import formatAmount, { useFormatAmount } from "@/utils/formatAmount";

const BulkCalculateRent = ({
  visible,
  setVisible,
  boardingHouseId,
  fetchRentPaymentData,
}) => {
  const { t, i18n } = useTranslation("calculateRent");
  const { darkMode } = useTheme();
  const [form] = Form.useForm();
  const { formatPrice } = useFormatAmount(i18n.language);

  // State
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [waterBillPrice, setWaterBillPrice] = useState(0);
  const [electricalBillPrice, setElectricalBillPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomCalculations, setRoomCalculations] = useState([]);
  const [totalEstimate, setTotalEstimate] = useState(0);
  const [calculating, setCalculating] = useState(false);
  const [progress, setProgress] = useState(0);

  const onClose = () => {
    setVisible(false);
    setSelectedRooms([]);
    setRoomCalculations([]);
    setTotalEstimate(0);
    form.resetFields();
  };

  const onOk = async () => {
    if (selectedRooms.length === 0) {
      toast.error(t("pleaseSelectRooms"));
      return;
    }

    setCalculating(true);
    setProgress(0);

    try {
      const payload = {
        roomIds: selectedRooms,
      };

      const res = await calculateBulkMonthlyBill(payload);

      if (res.success) {
        toast.success(
          `${t("bulkCalculationSuccess")}: ${res.summary.successful}/${
            res.summary.total
          } ${t("roomsProcessed")}`
        );

        if (res.errors && res.errors.length > 0) {
          toast.warning(`${res.errors.length} ${t("roomsHadErrors")}`);
        }

        fetchRentPaymentData();
        onClose();
      } else {
        toast.error(res.message || t("bulkCalculationError"));
      }
    } catch (error) {
      console.error("Error in bulk calculation:", error);
      toast.error(error.response?.data?.message || t("bulkCalculationError"));
    } finally {
      setCalculating(false);
      setProgress(0);
    }
  };

  // Fetch available rooms
  const fetchAvailableRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await getAvailableRooms(boardingHouseId);
      setAvailableRooms(res);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setAvailableRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Fetch utility prices
  const fetchElectricAndWaterPrice = async () => {
    try {
      const res = await getElectricalAndWaterPrice(boardingHouseId);
      setWaterBillPrice(Number(res.waterPrice));
      setElectricalBillPrice(Number(res.electricityPrice));
    } catch (error) {
      console.error("Error fetching utility prices:", error);
    }
  };

  // Calculate estimates for selected rooms
  const calculateEstimates = () => {
    const calculations = selectedRooms
      .map((roomId) => {
        const room = availableRooms.find((r) => r._id === roomId);
        if (!room) return null;

        const electricalConsumption = Math.max(
          0,
          (room.currentElectricityReading || 0) -
            (room.previousElectricityReading || 0)
        );
        const waterConsumption = Math.max(
          0,
          (room.currentWaterReading || 0) - (room.previousWaterReading || 0)
        );

        const electricalCost = electricalConsumption * electricalBillPrice;
        const waterCost = waterConsumption * waterBillPrice;
        const roomPrice = room.roomTypeId?.price || 0;

        // Note: Additional fees are calculated individually per room in the backend
        const totalAmount = roomPrice + electricalCost + waterCost;

        return {
          roomId,
          roomNumber: room.roomNumber,
          roomPrice,
          electricalCost,
          waterCost,
          totalAmount,
          tenantCount: room.rentBy?.length || 0,
        };
      })
      .filter(Boolean);

    setRoomCalculations(calculations);

    const total = calculations.reduce((sum, calc) => sum + calc.totalAmount, 0);
    setTotalEstimate(total);
  };

  // Handle room selection
  const handleRoomSelection = (roomIds) => {
    setSelectedRooms(roomIds);
  };

  // Select all rooms
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRooms(availableRooms.map((room) => room._id));
    } else {
      setSelectedRooms([]);
    }
  };

  // Effects
  useEffect(() => {
    if (boardingHouseId && visible) {
      fetchAvailableRooms();
      fetchElectricAndWaterPrice();
    }
  }, [boardingHouseId, visible]);

  useEffect(() => {
    if (selectedRooms.length > 0) {
      // No need to fetch additional fees since they're room-specific
    }
  }, [selectedRooms]);

  useEffect(() => {
    if (selectedRooms.length > 0 && electricalBillPrice && waterBillPrice) {
      calculateEstimates();
    } else {
      setRoomCalculations([]);
      setTotalEstimate(0);
    }
  }, [selectedRooms, electricalBillPrice, waterBillPrice, availableRooms]);

  // Styles
  const getStyles = () => {
    return {
      modalBodyStyle: darkMode
        ? { backgroundColor: "#1f2937", color: "#f9fafb" }
        : { backgroundColor: "#ffffff" },
      modalHeaderStyle: darkMode
        ? {
            backgroundColor: "#1f2937",
            borderBottom: "1px solid #374151",
            color: "#f9fafb",
          }
        : {
            borderBottom: "1px solid #e5e7eb",
          },
      inputStyle: darkMode
        ? {
            backgroundColor: "#374151",
            color: "#f9fafb",
            borderColor: "#4b5563",
          }
        : { backgroundColor: "#f9fafb" },
    };
  };

  const styles = getStyles();

  // Table columns for room calculations
  const columns = [
    {
      title: t("roomNumber"),
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: t("tenants"),
      dataIndex: "tenantCount",
      key: "tenantCount",
    },
    {
      title: t("roomPrice"),
      dataIndex: "roomPrice",
      key: "roomPrice",
      render: (price) => formatPrice(price, { showFullFormat: true }),
    },
    {
      title: t("electricalBill"),
      dataIndex: "electricalCost",
      key: "electricalCost",
      render: (cost) => formatPrice(cost, { showFullFormat: true }),
    },
    {
      title: t("waterBill"),
      dataIndex: "waterCost",
      key: "waterCost",
      render: (cost) => formatPrice(cost, { showFullFormat: true }),
    },
    {
      title: t("totalAmount") + " (" + t("excludingAdditionalFees") + ")",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (total) => (
        <strong style={{ color: "#3b82f6" }}>
          {formatPrice(total, { showFullFormat: true })}
        </strong>
      ),
    },
  ];

  return (
    <Modal
      title={t("bulkCalculateRent")}
      open={visible}
      onCancel={onClose}
      onOk={onOk}
      okText={calculating ? t("calculating") : t("calculate")}
      cancelText={t("cancel")}
      confirmLoading={calculating}
      destroyOnClose
      width={1000}
      style={{ top: 20 }}
      bodyStyle={{
        ...styles.modalBodyStyle,
        maxHeight: "none",
        overflowY: "visible",
        padding: "16px",
      }}
      headerStyle={styles.modalHeaderStyle}
      className={
        darkMode ? "dark-bulk-calculate-modal" : "bulk-calculate-modal"
      }
      okButtonProps={{
        disabled: selectedRooms.length === 0 || calculating,
        style: darkMode
          ? { background: "#3b82f6", borderColor: "#3b82f6" }
          : {},
      }}
      cancelButtonProps={{
        style: darkMode
          ? { background: "#374151", borderColor: "#4b5563", color: "#f9fafb" }
          : {},
      }}
    >
      <Form layout="vertical" form={form}>
        {/* Room Selection */}
        <Form.Item label={t("selectRooms")}>
          {loadingRooms ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin tip={t("loadingRooms")} />
            </div>
          ) : availableRooms.length > 0 ? (
            <div>
              <div style={{ marginBottom: "12px" }}>
                <Checkbox
                  checked={selectedRooms.length === availableRooms.length}
                  indeterminate={
                    selectedRooms.length > 0 &&
                    selectedRooms.length < availableRooms.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                >
                  {t("selectAll")} ({availableRooms.length} {t("rooms")})
                </Checkbox>
              </div>
              <Select
                mode="multiple"
                placeholder={t("selectRoomsToCalculate")}
                value={selectedRooms}
                onChange={handleRoomSelection}
                style={{ ...styles.inputStyle, width: "100%" }}
                dropdownStyle={
                  darkMode
                    ? { backgroundColor: "#374151", color: "#f9fafb" }
                    : {}
                }
                maxTagCount="responsive"
              >
                {availableRooms.map((room) => (
                  <Select.Option key={room._id} value={room._id}>
                    {room.roomNumber} ({room.rentBy?.length || 0} {t("tenants")}
                    )
                  </Select.Option>
                ))}
              </Select>
            </div>
          ) : (
            <Empty description={t("noAvailableRooms")} />
          )}
        </Form.Item>

        {/* Progress bar during calculation */}
        {calculating && (
          <div style={{ marginBottom: "16px" }}>
            <Progress
              percent={progress}
              status="active"
              strokeColor="#3b82f6"
              showInfo={true}
              format={(percent) => `${percent}% ${t("completed")}`}
            />
          </div>
        )}

        {/* Room Calculations Table */}
        {roomCalculations.length > 0 && (
          <Form.Item label={t("calculationPreview")}>
            <Table
              dataSource={roomCalculations}
              columns={columns}
              pagination={false}
              rowKey="roomId"
              size="small"
              bordered
              style={{
                backgroundColor: darkMode ? "#1f2937" : "#ffffff",
              }}
              scroll={{ x: 800 }}
            />

            {/* Total Summary */}
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                backgroundColor: darkMode ? "#1e40af" : "#eff6ff",
                borderRadius: "6px",
                textAlign: "center",
              }}
            >
              <strong
                style={{
                  color: darkMode ? "#bfdbfe" : "#3b82f6",
                  fontSize: "16px",
                }}
              >
                {t("totalEstimate")}:{" "}
                {formatPrice(totalEstimate, { showFullFormat: true })}
              </strong>
              <div style={{ marginTop: "4px", fontSize: "14px" }}>
                {selectedRooms.length} {t("rooms")} •{" "}
                {roomCalculations.reduce(
                  (sum, calc) => sum + calc.tenantCount,
                  0
                )}{" "}
                {t("totalTenants")}
              </div>
            </div>
          </Form.Item>
        )}

        {/* Warning */}
        {selectedRooms.length > 0 && (
          <Alert
            message={t("bulkCalculationWarning")}
            description={t("bulkCalculationWarningDescription")}
            type="warning"
            showIcon
            style={{ marginTop: "16px" }}
          />
        )}
      </Form>
    </Modal>
  );
};

export default BulkCalculateRent;
