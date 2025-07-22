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
  Segmented,
  Descriptions,
  Divider,
  Button,
  Row,
  Col,
} from "antd";
import { EyeOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";
import { getAvailableRooms } from "@/api/ownerUser/roomAPI";
import { toast } from "react-toastify";
import { getElectricalAndWaterPrice } from "@/api/ownerUser/boardingHouseAPI";
import { calculateBulkMonthlyBill } from "@/api/ownerUser/paymentBillAPI";
import { calculateMonthlyBill } from "@/api/ownerUser/paymentBillAPI";
import { getRoomAdditionFeeForMonthlyCalculate } from "@/api/staffUser/roomAdditionFee";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import formatAmount, { useFormatAmount } from "@/utils/formatAmount";

const UnifiedCalculateRent = ({
  visible,
  setVisible,
  boardingHouseId,
  fetchRentPaymentData,
}) => {
  const { t, i18n } = useTranslation("calculateRent");
  const { darkMode } = useTheme();
  const [form] = Form.useForm();
  const { formatPrice } = useFormatAmount(i18n.language);

  // Mode state
  const [calculationMode, setCalculationMode] = useState("single");

  // Common state
  const [availableRooms, setAvailableRooms] = useState([]);
  const [waterBillPrice, setWaterBillPrice] = useState(0);
  const [electricalBillPrice, setElectricalBillPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Single room state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomPrice, setRoomPrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [additionalFees, setAdditionalFees] = useState([]);
  const [loadingFees, setLoadingFees] = useState(false);

  // Bulk calculation state
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomCalculations, setRoomCalculations] = useState([]);
  const [totalEstimate, setTotalEstimate] = useState(0);
  const [progress, setProgress] = useState(0);

  const onClose = () => {
    setVisible(false);
    setSelectedRoom(null);
    setSelectedRooms([]);
    setRoomCalculations([]);
    setTotalEstimate(0);
    setAdditionalFees([]);
    setTotalAmount(0);
    setRoomPrice(0);
    form.resetFields();
  };

  const onOk = async () => {
    if (calculationMode === "single") {
      await handleSingleCalculation();
    } else {
      await handleBulkCalculation();
    }
  };

  const handleSingleCalculation = async () => {
    if (!selectedRoom) {
      toast.error(t("pleaseSelectRoom"));
      return;
    }

    const room = availableRooms.find((r) => r._id === selectedRoom);
    if (!room) {
      toast.error(t("roomNotFound"));
      return;
    }

    const oldElectrical = room.previousElectricityReading || 0;
    const newElectrical = room.currentElectricityReading || 0;
    const oldWater = room.previousWaterReading || 0;
    const newWater = room.currentWaterReading || 0;

    if (newElectrical < oldElectrical || newWater < oldWater) {
      toast.error(t("newGreaterThanOld"));
      return;
    }

    setCalculating(true);

    try {
      const payload = {
        roomId: selectedRoom,
        paymentAmount: totalAmount,
        additionalFees: additionalFees,
      };

      const res = await calculateMonthlyBill(payload);

      toast.success(t("calculationSuccess"));
      fetchRentPaymentData();
      onClose();
    } catch (error) {
      console.error("Error in single calculation:", error);
      toast.error(error.response?.data?.message || t("calculationError"));
    } finally {
      setCalculating(false);
    }
  };

  const handleBulkCalculation = async () => {
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
      setElectricalBillPrice(res.electricityPrice || 0);
      setWaterBillPrice(res.waterPrice || 0);
    } catch (error) {
      console.error("Error fetching prices:", error);
      toast.error(t("errorFetchingPrices"));
    }
  };

  // Handle viewing room details in bulk mode
  const handleViewRoomDetails = (record) => {
    // You can implement a detailed view modal here
    console.log("Viewing details for room:", record);
    // For now, just log the data
    toast.info(`${t("roomDetails")}: ${record.roomNumber}`);
  };

  // Single room functions
  const fetchAdditionalFees = async (roomId) => {
    if (!roomId) return;

    setLoadingFees(true);
    try {
      const response = await getRoomAdditionFeeForMonthlyCalculate(roomId);
      if (response.success && response.additionalFees) {
        setAdditionalFees(response.additionalFees);
      } else {
        setAdditionalFees([]);
      }
    } catch (error) {
      console.error("Error fetching additional fees:", error);
      setAdditionalFees([]);
    } finally {
      setLoadingFees(false);
    }
  };

  const calculateElectricalPrice = () => {
    if (!selectedRoom || !availableRooms.length) return 0;
    const room = availableRooms.find((r) => r._id === selectedRoom);
    if (!room) return 0;

    const consumption = Math.max(
      0,
      (room.currentElectricityReading || 0) -
        (room.previousElectricityReading || 0)
    );
    return consumption * electricalBillPrice;
  };

  const calculateWaterPrice = () => {
    if (!selectedRoom || !availableRooms.length) return 0;
    const room = availableRooms.find((r) => r._id === selectedRoom);
    if (!room) return 0;

    const consumption = Math.max(
      0,
      (room.currentWaterReading || 0) - (room.previousWaterReading || 0)
    );
    return consumption * waterBillPrice;
  };

  const calculateTotalAmount = () => {
    const electricalCost = calculateElectricalPrice();
    const waterCost = calculateWaterPrice();
    const additionalFeesTotal = additionalFees.reduce(
      (sum, fee) => sum + (Number(fee.feeAmount) || 0),
      0
    );
    const total = roomPrice + electricalCost + waterCost + additionalFeesTotal;
    setTotalAmount(total);
  };

  // Bulk calculation functions
  const calculateEstimates = async () => {
    const calculations = await Promise.all(
      selectedRooms.map(async (roomId) => {
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

        // Fetch additional fees for this room
        let additionalFeesTotal = 0;
        try {
          const response = await getRoomAdditionFeeForMonthlyCalculate(roomId);
          if (response.success && response.additionalFees) {
            additionalFeesTotal = response.additionalFees.reduce(
              (sum, fee) => sum + (Number(fee.feeAmount) || 0),
              0
            );
          }
        } catch (error) {
          console.error(
            `Error fetching additional fees for room ${room.roomNumber}:`,
            error
          );
        }

        const totalAmount =
          roomPrice + electricalCost + waterCost + additionalFeesTotal;

        return {
          roomId,
          roomNumber: room.roomNumber,
          roomPrice,
          electricalCost,
          waterCost,
          additionalFeesTotal,
          totalAmount,
          tenantCount: room.rentBy?.length || 0,
        };
      })
    );

    const validCalculations = calculations.filter(Boolean);
    setRoomCalculations(validCalculations);

    const total = validCalculations.reduce(
      (sum, calc) => sum + calc.totalAmount,
      0
    );
    setTotalEstimate(total);
  };

  const handleRoomSelection = (roomIds) => {
    setSelectedRooms(roomIds);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRooms(availableRooms.map((room) => room._id));
    } else {
      setSelectedRooms([]);
    }
  };

  const handleSingleRoomChange = (value) => {
    setSelectedRoom(value);
    if (value) {
      const room = availableRooms.find((r) => r._id === value);
      if (room) {
        setRoomPrice(room.roomTypeId?.price || 0);
        fetchAdditionalFees(value);
      }
    } else {
      setRoomPrice(0);
      setAdditionalFees([]);
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
    if (
      calculationMode === "single" &&
      selectedRoom &&
      electricalBillPrice &&
      waterBillPrice
    ) {
      calculateTotalAmount();
    }
  }, [
    roomPrice,
    selectedRoom,
    electricalBillPrice,
    waterBillPrice,
    additionalFees,
    availableRooms,
    calculationMode,
  ]);

  useEffect(() => {
    if (
      calculationMode === "bulk" &&
      selectedRooms.length > 0 &&
      electricalBillPrice &&
      waterBillPrice
    ) {
      calculateEstimates();
    } else if (calculationMode === "bulk") {
      setRoomCalculations([]);
      setTotalEstimate(0);
    }
  }, [
    selectedRooms,
    electricalBillPrice,
    waterBillPrice,
    availableRooms,
    calculationMode,
  ]);

  // Reset data when mode changes
  useEffect(() => {
    setSelectedRoom(null);
    setSelectedRooms([]);
    setRoomCalculations([]);
    setTotalEstimate(0);
    setAdditionalFees([]);
    setTotalAmount(0);
    setRoomPrice(0);
    form.resetFields();
  }, [calculationMode]);

  // Styles
  const getStyles = () => {
    return {
      modalBodyStyle: {
        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
        color: darkMode ? "#f9fafb" : "#1f2937",
      },
      modalHeaderStyle: {
        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
        borderBottom: darkMode ? "1px solid #374151" : "1px solid #d1d5db",
      },
      inputStyle: {
        backgroundColor: darkMode ? "#374151" : "#ffffff",
        borderColor: darkMode ? "#4b5563" : "#d1d5db",
        color: darkMode ? "#f9fafb" : "#1f2937",
      },
    };
  };

  const styles = getStyles();

  // Table columns for bulk calculation
  const bulkColumns = [
    {
      title: t("roomNumber"),
      dataIndex: "roomNumber",
      key: "roomNumber",
      width: "12%",
      render: (roomNumber) => (
        <strong style={{ color: darkMode ? "#3b82f6" : "#1e40af" }}>
          {roomNumber}
        </strong>
      ),
    },
    {
      title: t("tenants"),
      dataIndex: "tenantCount",
      key: "tenantCount",
      width: "10%",
      align: "center",
    },
    {
      title: t("roomPrice"),
      dataIndex: "roomPrice",
      key: "roomPrice",
      width: "15%",
      align: "right",
      render: (price) => formatPrice(price, { showFullFormat: true }),
    },
    {
      title: t("electricalBill"),
      dataIndex: "electricalCost",
      key: "electricalCost",
      width: "15%",
      align: "right",
      render: (cost) => formatPrice(cost, { showFullFormat: true }),
    },
    {
      title: t("waterBill"),
      dataIndex: "waterCost",
      key: "waterCost",
      width: "15%",
      align: "right",
      render: (cost) => formatPrice(cost, { showFullFormat: true }),
    },
    {
      title: t("additionalFees"),
      dataIndex: "additionalFeesTotal",
      key: "additionalFeesTotal",
      width: "15%",
      align: "right",
      render: (fees) => (
        <span style={{ color: darkMode ? "#fbbf24" : "#d97706" }}>
          {formatPrice(fees, { showFullFormat: true })}
        </span>
      ),
    },
    {
      title: t("totalAmount"),
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: "18%",
      align: "right",
      render: (total) => (
        <strong
          style={{
            color: darkMode ? "#10b981" : "#059669",
            fontSize: "16px",
          }}
        >
          {formatPrice(total, { showFullFormat: true })}
        </strong>
      ),
    },
  ];

  const renderAmountColumn = (amount) => {
    return formatPrice(amount, { showFullFormat: true });
  };

  const selectedRoomData = selectedRoom
    ? availableRooms.find((r) => r._id === selectedRoom)
    : null;

  // Custom styles for dark mode
  const customStyles = `
    .dark-calculate-modal .ant-modal-content {
      background-color: #1f2937 !important;
      color: #f9fafb !important;
    }
    .dark-calculate-modal .ant-modal-header {
      background-color: #1f2937 !important;
      border-bottom: 1px solid #374151 !important;
    }
    .dark-calculate-modal .ant-modal-title {
      color: #f9fafb !important;
    }
    .dark-form .ant-form-item-label > label {
      color: #f9fafb !important;
    }
    .dark-segmented .ant-segmented-item-label {
      color: #f9fafb !important;
    }
    .dark-segmented .ant-segmented-item:hover {
      background-color: #4b5563 !important;
    }
    .dark-segmented .ant-segmented-item-selected {
      background-color: #3b82f6 !important;
      color: #ffffff !important;
    }
    .dark-table .ant-table {
      background-color: #1f2937 !important;
      color: #f9fafb !important;
    }
    .dark-table .ant-table-thead > tr > th {
      background-color: #374151 !important;
      color: #f9fafb !important;
      border-bottom: 1px solid #4b5563 !important;
    }
    .dark-table .ant-table-tbody > tr > td {
      background-color: #1f2937 !important;
      color: #f9fafb !important;
      border-bottom: 1px solid #374151 !important;
    }
    .dark-table .ant-table-tbody > tr:hover > td {
      background-color: #374151 !important;
    }
    .dark-calculate-modal .ant-alert {
      background-color: ${darkMode ? "#1e3a8a" : "#dbeafe"} !important;
      border: 1px solid ${darkMode ? "#3b82f6" : "#93c5fd"} !important;
      color: ${darkMode ? "#f9fafb" : "#1e40af"} !important;
    }
    .dark-calculate-modal .ant-alert-message {
      color: ${darkMode ? "#f9fafb" : "#1e40af"} !important;
    }
    .dark-calculate-modal .ant-alert-description {
      color: ${darkMode ? "#e5e7eb" : "#374151"} !important;
    }
    .dark-calculate-modal .ant-select-selector {
      background-color: #374151 !important;
      border-color: #4b5563 !important;
      color: #f9fafb !important;
    }
    .dark-calculate-modal .ant-select-arrow {
      color: #f9fafb !important;
    }
    .dark-calculate-modal .ant-empty-description {
      color: #9ca3af !important;
    }
  `;

  return (
    <>
      <style>{customStyles}</style>
      <Modal
        title={t("calculateRent")}
        open={visible}
        onCancel={onClose}
        destroyOnClose
        width={calculationMode === "bulk" ? 800 : 700}
        style={{ top: 20 }}
        bodyStyle={{
          ...styles.modalBodyStyle,
          maxHeight: "none",
          overflowY: "visible",
          padding: "16px",
        }}
        headerStyle={styles.modalHeaderStyle}
        className={darkMode ? "dark-calculate-modal" : "calculate-modal"}
        cancelButtonProps={{
          style: darkMode
            ? {
                background: "#374151",
                borderColor: "#4b5563",
                color: "#f9fafb",
              }
            : {},
        }}
        footer={[
          <Button
            key="cancel"
            onClick={onClose}
            style={
              darkMode
                ? {
                    background: "#374151",
                    borderColor: "#4b5563",
                    color: "#f9fafb",
                  }
                : {}
            }
          >
            {t("cancel")}
          </Button>,
          <Button
            key="ok"
            type="primary"
            loading={calculating}
            onClick={onOk}
            disabled={
              (calculationMode === "single" && !selectedRoom) ||
              (calculationMode === "bulk" && selectedRooms.length === 0) ||
              calculating
            }
            style={
              darkMode ? { background: "#3b82f6", borderColor: "#3b82f6" } : {}
            }
          >
            {calculating ? t("calculating") : t("calculate")}
          </Button>,
        ]}
      >
        <Form
          layout="vertical"
          form={form}
          className={darkMode ? "dark-form" : ""}
          style={{ color: darkMode ? "#f9fafb" : "#1f2937" }}
        >
          {/* Mode Selection */}
          <Form.Item label={t("calculationMode")}>
            <Segmented
              value={calculationMode}
              onChange={setCalculationMode}
              options={[
                {
                  label: t("singleRoom"),
                  value: "single",
                  icon: "🏠",
                },
                {
                  label: t("bulkCalculation"),
                  value: "bulk",
                  icon: "📊",
                },
              ]}
              style={{
                backgroundColor: darkMode ? "#374151" : "#f3f4f6",
                color: darkMode ? "#f9fafb" : "#1f2937",
              }}
              className={darkMode ? "dark-segmented" : ""}
              size="large"
            />
          </Form.Item>

          <Divider style={{ borderColor: darkMode ? "#374151" : "#e5e7eb" }} />

          {calculationMode === "single" ? (
            // Single Room Mode
            <>
              {/* Room Selection */}
              <Form.Item label={t("selectRoom")}>
                {loadingRooms ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spin tip={t("loadingRooms")} />
                  </div>
                ) : availableRooms.length > 0 ? (
                  <Select
                    placeholder={t("selectRoom")}
                    value={selectedRoom}
                    onChange={handleSingleRoomChange}
                    style={{ ...styles.inputStyle, width: "100%" }}
                    dropdownStyle={
                      darkMode
                        ? { backgroundColor: "#374151", color: "#f9fafb" }
                        : {}
                    }
                  >
                    {availableRooms.map((room) => (
                      <Select.Option key={room._id} value={room._id}>
                        {room.roomNumber} ({room.rentBy?.length || 0}{" "}
                        {t("tenants")})
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <Empty description={t("noAvailableRooms")} />
                )}
              </Form.Item>

              {/* Room Details */}
              {selectedRoomData && (
                <>
                  <Form.Item label={t("utilityReadingsNote")}>
                    <Alert
                      message={t("utilityReadingsNote")}
                      description={t("utilityReadingsDescription")}
                      type="info"
                      showIcon
                    />
                  </Form.Item>

                  {/* Room Information Table */}
                  <Form.Item label={t("roomInformation")}>
                    <Table
                      dataSource={[
                        {
                          key: "roomInfo",
                          item: t("roomNumber"),
                          value: selectedRoomData.roomNumber,
                          type: "text",
                        },
                        {
                          key: "roomPrice",
                          item: t("roomPrice"),
                          value: roomPrice,
                          type: "currency",
                        },
                        {
                          key: "tenants",
                          item: t("tenants"),
                          value: `${selectedRoomData.rentBy?.length || 0} ${t(
                            "totalTenants"
                          )}`,
                          type: "text",
                        },
                      ]}
                      columns={[
                        {
                          title: t("item"),
                          dataIndex: "item",
                          key: "item",
                          width: "40%",
                          render: (text) => <strong>{text}</strong>,
                        },
                        {
                          title: t("value"),
                          dataIndex: "value",
                          key: "value",
                          render: (value, record) =>
                            record.type === "currency"
                              ? renderAmountColumn(value)
                              : value,
                        },
                      ]}
                      pagination={false}
                      size="small"
                      bordered
                      style={{
                        backgroundColor: darkMode ? "#374151" : "#f9fafb",
                      }}
                    />
                  </Form.Item>

                  {/* Utility Consumption Table */}
                  <Form.Item label={t("utilityConsumption")}>
                    <Table
                      dataSource={[
                        {
                          key: "electricity",
                          type: t("electricalBill"),
                          previous:
                            selectedRoomData.previousElectricityReading || 0,
                          current:
                            selectedRoomData.currentElectricityReading || 0,
                          consumption: Math.max(
                            0,
                            (selectedRoomData.currentElectricityReading || 0) -
                              (selectedRoomData.previousElectricityReading || 0)
                          ),
                          price: electricalBillPrice,
                          total: calculateElectricalPrice(),
                          unit: "kWh",
                        },
                        {
                          key: "water",
                          type: t("waterBill"),
                          previous: selectedRoomData.previousWaterReading || 0,
                          current: selectedRoomData.currentWaterReading || 0,
                          consumption: Math.max(
                            0,
                            (selectedRoomData.currentWaterReading || 0) -
                              (selectedRoomData.previousWaterReading || 0)
                          ),
                          price: waterBillPrice,
                          total: calculateWaterPrice(),
                          unit: "m³",
                        },
                      ]}
                      columns={[
                        {
                          title: t("type"),
                          dataIndex: "type",
                          key: "type",
                          width: "15%",
                          render: (text) => <strong>{text}</strong>,
                        },
                        {
                          title: t("previousReading"),
                          dataIndex: "previous",
                          key: "previous",
                          width: "15%",
                          align: "center",
                        },
                        {
                          title: t("currentReading"),
                          dataIndex: "current",
                          key: "current",
                          width: "15%",
                          align: "center",
                        },
                        {
                          title: t("consumption"),
                          dataIndex: "consumption",
                          key: "consumption",
                          width: "15%",
                          align: "center",
                          render: (value, record) => `${value} ${record.unit}`,
                        },
                        {
                          title: t("unitPrice"),
                          dataIndex: "price",
                          key: "price",
                          width: "20%",
                          align: "right",
                          render: (value, record) =>
                            `${formatPrice(value)}/${record.unit}`,
                        },
                        {
                          title: t("totalAmount"),
                          dataIndex: "total",
                          key: "total",
                          width: "20%",
                          align: "right",
                          render: (value) => (
                            <strong style={{ color: "#3b82f6" }}>
                              {renderAmountColumn(value)}
                            </strong>
                          ),
                        },
                      ]}
                      pagination={false}
                      size="small"
                      bordered
                      style={{
                        backgroundColor: darkMode ? "#374151" : "#f9fafb",
                      }}
                    />
                  </Form.Item>

                  {/* Additional Fees */}
                  <Form.Item label={t("additionalFees")}>
                    {loadingFees ? (
                      <Spin tip={t("loadingFees")} />
                    ) : additionalFees.length > 0 ? (
                      <Table
                        dataSource={additionalFees.map((fee, index) => ({
                          key: index,
                          feeName: fee.feeName,
                          feeAmount: fee.feeAmount,
                        }))}
                        columns={[
                          {
                            title: t("feeName"),
                            dataIndex: "feeName",
                            key: "feeName",
                          },
                          {
                            title: t("amount"),
                            dataIndex: "feeAmount",
                            key: "feeAmount",
                            render: renderAmountColumn,
                          },
                        ]}
                        pagination={false}
                        size="small"
                        bordered
                      />
                    ) : (
                      <Alert
                        message={t("noAdditionalFees")}
                        type="info"
                        showIcon
                      />
                    )}
                  </Form.Item>

                  {/* Total Calculation Breakdown */}
                  <Form.Item label={t("calculationBreakdown")}>
                    <Table
                      dataSource={[
                        {
                          key: "roomPrice",
                          description: t("roomPrice"),
                          amount: roomPrice,
                          type: "base",
                        },
                        {
                          key: "electricalBill",
                          description: t("electricalBill"),
                          amount: calculateElectricalPrice(),
                          type: "utility",
                        },
                        {
                          key: "waterBill",
                          description: t("waterBill"),
                          amount: calculateWaterPrice(),
                          type: "utility",
                        },
                        {
                          key: "additionalFees",
                          description: t("additionalFees"),
                          amount: additionalFees.reduce(
                            (sum, fee) => sum + (Number(fee.feeAmount) || 0),
                            0
                          ),
                          type: "additional",
                        },
                        {
                          key: "total",
                          description: t("totalAmount"),
                          amount: totalAmount,
                          type: "total",
                        },
                      ]}
                      columns={[
                        {
                          title: t("description"),
                          dataIndex: "description",
                          key: "description",
                          width: "70%",
                          render: (text, record) => (
                            <span
                              style={{
                                fontWeight:
                                  record.type === "total" ? "bold" : "normal",
                                fontSize:
                                  record.type === "total" ? "16px" : "14px",
                              }}
                            >
                              {text}
                            </span>
                          ),
                        },
                        {
                          title: t("amount"),
                          dataIndex: "amount",
                          key: "amount",
                          width: "30%",
                          align: "right",
                          render: (amount, record) => (
                            <span
                              style={{
                                fontWeight:
                                  record.type === "total" ? "bold" : "normal",
                                fontSize:
                                  record.type === "total" ? "16px" : "14px",
                                color:
                                  record.type === "total"
                                    ? "#3b82f6"
                                    : "inherit",
                              }}
                            >
                              {renderAmountColumn(amount)}
                            </span>
                          ),
                        },
                      ]}
                      pagination={false}
                      size="small"
                      bordered
                      style={{
                        backgroundColor: darkMode ? "#374151" : "#f9fafb",
                      }}
                      summary={() => (
                        <Table.Summary fixed>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0}>
                              <div
                                style={{
                                  padding: "8px",
                                  backgroundColor: darkMode
                                    ? "#1e40af"
                                    : "#eff6ff",
                                  borderRadius: "4px",
                                  textAlign: "center",
                                }}
                              >
                                <strong
                                  style={{
                                    fontSize: "18px",
                                    color: darkMode ? "#bfdbfe" : "#3b82f6",
                                  }}
                                >
                                  {t("finalTotal")}:{" "}
                                  {renderAmountColumn(totalAmount)}
                                </strong>
                              </div>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </Table.Summary>
                      )}
                    />
                  </Form.Item>
                </>
              )}
            </>
          ) : (
            // Bulk Mode
            <>
              {/* Utility Prices Information */}
              {electricalBillPrice > 0 && waterBillPrice > 0 && (
                <Form.Item label={t("utilityPrices")}>
                  <Alert
                    message={t("utilityPricesInfo")}
                    description={
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <strong>{t("electricalBill")}:</strong>{" "}
                          {formatPrice(electricalBillPrice)}/kWh
                        </div>
                        <div>
                          <strong>{t("waterBill")}:</strong>{" "}
                          {formatPrice(waterBillPrice)}/m³
                        </div>
                      </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: "16px" }}
                  />
                </Form.Item>
              )}

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
                          {room.roomNumber} ({room.rentBy?.length || 0}{" "}
                          {t("tenants")})
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
                <>
                  <Form.Item label={t("calculationPreview")}>
                    <Table
                      dataSource={roomCalculations}
                      columns={bulkColumns}
                      pagination={false}
                      rowKey="roomId"
                      size="small"
                      bordered
                      className={darkMode ? "dark-table" : ""}
                      style={{
                        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      }}
                      scroll={{ x: 700 }}
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
                      <div
                        style={{
                          fontSize: "12px",
                          marginTop: "4px",
                          opacity: 0.8,
                        }}
                      >
                        ({t("excludingAdditionalFees")})
                      </div>
                    </div>
                  </Form.Item>
                </>
              )}
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default UnifiedCalculateRent;
