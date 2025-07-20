import React, { useEffect, useState, useContext } from "react";
import { Modal, Form, Input, Table, Select, Spin, Empty } from "antd";
import { getAvailableRooms } from "@/api/ownerUser/roomAPI";
import { toast } from "react-toastify";
import { getElectricalAndWaterPrice } from "@/api/ownerUser/boardingHouseAPI";
import { calculateMonthlyBill } from "@/api/ownerUser/paymentBillAPI";
import { getRoomAdditionFeeForMonthlyCalculate } from "@/api/staffUser/roomAdditionFee";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import formatAmount, { useFormatAmount } from "@/utils/formatAmount";

const CalculateRent = ({
  visible,
  setVisible,
  boardingHouseId,
  fetchRentPaymentData,
}) => {
  const { t, i18n } = useTranslation("calculateRent"); // Get both t and i18n
  const { darkMode } = useTheme();
  const [form] = Form.useForm();
  const [additionalFees, setAdditionalFees] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectRoom, setSelectRoom] = useState(null);
  const [roomPrice, setRoomPrice] = useState(0);
  const [waterBillPrice, setWaterBillPrice] = useState(0);
  const [electricalBillPrice, setElectricalBillPrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingFees, setLoadingFees] = useState(false);
  const [previousMonth, setPreviousMonth] = useState(null);
  const [previousYear, setPreviousYear] = useState(null);

  // Use the useFormatAmount hook to get language-aware formatting functions
  const { formatPrice } = useFormatAmount(i18n.language);

  const onClose = () => {
    setVisible(false);
    setAdditionalFees([]);
    setSelectRoom(null);
    form.resetFields();
  };

  const onOk = async () => {
    const values = form.getFieldsValue();

    if (values.roomNumber === undefined) {
      toast.error(t("fillAllFields"));
      return;
    }

    // Check if room has current utility readings
    const selectedRoom = availableRooms.find((room) => room._id === selectRoom);
    if (!selectedRoom) {
      toast.error(t("roomNotFound"));
      return;
    }

    if (
      selectedRoom.currentElectricityReading === undefined ||
      selectedRoom.currentElectricityReading === null ||
      selectedRoom.currentWaterReading === undefined ||
      selectedRoom.currentWaterReading === null
    ) {
      toast.error(t("pleaseUpdateUtilityReadings"));
      return;
    }

    // Convert additional fees to the format expected by the API
    const formattedFees = additionalFees.map((fee) => ({
      feeName: fee.name || fee.feeName,
      feeAmount: Number(fee.amount || fee.feeAmount) || 0,
    }));

    const payload = {
      roomId: selectRoom,
      paymentAmount: totalAmount,
      additionalFee: formattedFees,
    };

    setLoading(true);
    try {
      const res = await calculateMonthlyBill(payload);
      toast.success(res.message || t("calculationSuccess"));
      fetchRentPaymentData();
    } catch (error) {
      console.error("Error calculating rent:", error);
      toast.error(error.response?.data?.message || t("calculationError"));
    } finally {
      setLoading(false);
      onClose();
    }
  };

  // This function will fetch additional fees when a room is selected
  const fetchAdditionalFees = async (roomId) => {
    if (!roomId) return;

    setLoadingFees(true);
    try {
      const response = await getRoomAdditionFeeForMonthlyCalculate(roomId);

      if (response.success) {
        // Format the fees to match our component's expected structure
        const fees = response.additionalFees.map((fee, index) => ({
          key: index,
          feeName: fee.feeName,
          feeAmount: fee.feeAmount,
        }));

        setAdditionalFees(fees);
        setPreviousMonth(response.month);
        setPreviousYear(response.year);
      } else {
        setAdditionalFees([]);
      }
    } catch (error) {
      console.error("Error fetching additional fees:", error);
      // No error toast for missing fees - silently handle it
      setAdditionalFees([]);
    } finally {
      setLoadingFees(false);
    }
  };

  const calculateElectricalPrice = () => {
    const selectedRoom = availableRooms.find((room) => room._id === selectRoom);
    if (!selectedRoom) return 0;

    const consumption = Math.max(
      0,
      (selectedRoom.currentElectricityReading || 0) -
        (selectedRoom.previousElectricityReading || 0)
    );
    return consumption * electricalBillPrice;
  };

  const calculateWaterPrice = () => {
    const selectedRoom = availableRooms.find((room) => room._id === selectRoom);
    if (!selectedRoom) return 0;

    const consumption = Math.max(
      0,
      (selectedRoom.currentWaterReading || 0) -
        (selectedRoom.previousWaterReading || 0)
    );
    return consumption * waterBillPrice;
  };

  const calculateTotalAmount = () => {
    const additionalFeesTotal = additionalFees.reduce((sum, fee) => {
      const amount = Number(fee.amount || fee.feeAmount) || 0;
      return sum + amount;
    }, 0);

    return (
      roomPrice +
      calculateElectricalPrice() +
      calculateWaterPrice() +
      additionalFeesTotal
    );
  };

  useEffect(() => {
    const total = calculateTotalAmount();
    setTotalAmount(total);
  }, [
    roomPrice,
    selectRoom,
    electricalBillPrice,
    waterBillPrice,
    additionalFees,
    availableRooms,
  ]);

  const fetchAvailableRooms = async () => {
    try {
      const res = await getAvailableRooms(boardingHouseId);
      setAvailableRooms(res);
    } catch (error) {
      setAvailableRooms([]);
    }
  };

  const fetchElectricAndWaterPrice = async () => {
    try {
      const res = await getElectricalAndWaterPrice(boardingHouseId);
      setWaterBillPrice(Number(res.waterPrice));
      setElectricalBillPrice(Number(res.electricityPrice));
    } catch (error) {
      console.error("Error fetching electric and water price:", error);
    }
  };

  useEffect(() => {
    if (boardingHouseId) {
      fetchAvailableRooms();
      fetchElectricAndWaterPrice();
    }
  }, [boardingHouseId]);

  // When room selection changes, fetch room details and additional fees
  useEffect(() => {
    if (selectRoom) {
      const selectedRoom = availableRooms.find(
        (room) => room._id === selectRoom
      );

      if (selectedRoom) {
        // Set room price from room type
        setRoomPrice(selectedRoom?.roomTypeId?.price || 0);

        // Fetch additional fees for this room
        fetchAdditionalFees(selectRoom);
      }
    }
  }, [selectRoom, availableRooms]);

  const handleRoomChange = (value) => {
    setSelectRoom(value);
    form.setFieldsValue({ roomNumber: value });
  };

  // Updated getStyles function with colors from your tailwind.config.js
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

      readOnlyStyle: darkMode
        ? {
            backgroundColor: "#374151",
            color: "#f9fafb",
            borderColor: "#4b5563",
            fontWeight: "bold",
          }
        : {
            backgroundColor: "#f8fafc",
            fontWeight: "bold",
          },

      totalAmountStyle: darkMode
        ? {
            backgroundColor: "#1e40af",
            color: "#bfdbfe",
            fontWeight: "bold",
            fontSize: "16px",
            borderColor: "#3b82f6",
          }
        : {
            backgroundColor: "#eff6ff",
            fontWeight: "bold",
            color: "#3b82f6",
            fontSize: "16px",
            borderColor: "#bfdbfe",
          },

      fromMonthStyle: darkMode
        ? { fontStyle: "italic", color: "#9ca3af" }
        : { fontStyle: "italic", color: "#6b7280" },

      tableHeaderStyle: darkMode
        ? {
            backgroundColor: "#374151",
            color: "#f9fafb",
            borderColor: "#4b5563",
          }
        : {},

      tableStyle: darkMode
        ? {
            backgroundColor: "#1f2937",
            borderColor: "#4b5563",
            color: "#f9fafb",
          }
        : {},

      emptyStyle: darkMode ? { color: "#9ca3af" } : { color: "#6b7280" },
    };
  };

  const styles = getStyles();

  useEffect(() => {
    // Add a class when the modal is visible
    if (visible) {
      document.body.classList.add(
        darkMode ? "dark-modal-open" : "light-modal-open"
      );
    }

    return () => {
      // Clean up when modal closes
      document.body.classList.remove("dark-modal-open", "light-modal-open");
    };
  }, [visible, darkMode]);

  // Add this useEffect for dynamic styling without external CSS
  useEffect(() => {
    // Function to inject styles into document head
    const injectStyles = () => {
      // Remove any existing style element first
      const existingStyle = document.getElementById("calculate-rent-styles");
      if (existingStyle) {
        existingStyle.remove();
      }

      if (visible) {
        // Create style element for both dark and light mode styles
        const style = document.createElement("style");
        style.id = "calculate-rent-styles";

        if (darkMode) {
          style.innerHTML = `
            .ant-modal-content {
              background-color: #1f2937 !important;
              border-color: #374151 !important;
              max-height: 90vh !important;
            }
            
            .ant-modal-body {
              background-color: #1f2937 !important;
              max-height: 70vh !important;
              overflow-y: auto !important;
              padding: 16px !important;
            }
            
            .ant-modal-header {
              background-color: #1f2937 !important;
              border-bottom-color: #374151 !important;
            }
            
            .ant-modal-title {
              color: #f9fafb !important;
            }
            
            .ant-modal-close {
              color: #f9fafb !important;
            }
            
            .ant-modal-close:hover {
              color: #e5e7eb !important;
              background-color: #374151 !important;
            }
            
            .ant-form-item-label > label {
              color: #f9fafb !important;
            }
            
            .ant-select-selector {
              background-color: #374151 !important;
              color: #f9fafb !important;
              border-color: #4b5563 !important;
            }
            
            .ant-select-selection-placeholder {
              color: #9ca3af !important;
            }
            
            .ant-select-arrow {
              color: #f9fafb !important;
            }
            
            .ant-input {
              background-color: #374151 !important;
              color: #f9fafb !important;
              border-color: #4b5563 !important;
            }
            
            .ant-input:hover {
              border-color: #3b82f6 !important;
            }
            
            .ant-input:focus {
              border-color: #3b82f6 !important;
              box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
            }
            
            .ant-input-group-addon {
              background-color: #4b5563 !important;
              color: #f9fafb !important;
              border-color: #4b5563 !important;
            }
            
            .ant-table {
              background-color: #1f2937 !important;
            }
            
            .ant-table-thead > tr > th {
              background-color: #374151 !important;
              color: #f9fafb !important;
              border-color: #4b5563 !important;
            }
            
            .ant-table-tbody > tr > td {
              background-color: #1f2937 !important;
              color: #f9fafb !important;
              border-color: #4b5563 !important;
            }
            
            .ant-table-tbody > tr:hover > td {
              background-color: #374151 !important;
            }
            
            .ant-empty-description {
              color: #9ca3af !important;
            }
            
            .ant-btn-default {
              background-color: #374151 !important;
              border-color: #4b5563 !important;
              color: #f9fafb !important;
            }
            
            .ant-btn-default:hover {
              background-color: #4b5563 !important;
              border-color: #6b7280 !important;
              color: #f9fafb !important;
            }
            
            .ant-btn-primary {
              background-color: #3b82f6 !important;
              border-color: #3b82f6 !important;
            }
            
            .ant-btn-primary:hover {
              background-color: #2563eb !important;
              border-color: #2563eb !important;
            }
            
            .ant-spin-dot-item {
              background-color: #3b82f6 !important;
            }
          `;
        } else {
          // Light mode styles - chỉ cần kiểm soát scroll
          style.innerHTML = `
            .ant-modal-content {
              max-height: 90vh !important;
            }
            
            .ant-modal-body {
              max-height: 70vh !important;
              overflow-y: auto !important;
            }
          `;
        }
        document.head.appendChild(style);
      }
    };

    injectStyles();

    return () => {
      // Clean up styles on unmount
      const existingStyle = document.getElementById("calculate-rent-styles");
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [visible, darkMode]);

  // Update the table column for amount formatting
  const renderAmountColumn = (amount) => {
    return <span>{formatPrice(amount, { showFullFormat: true })}</span>;
  };

  return (
    <Modal
      title={t("calculateRent")}
      open={visible}
      onCancel={onClose}
      onOk={onOk}
      okText={t("calculate")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      destroyOnClose
      width={700}
      centered
      style={{
        maxHeight: "90vh",
      }}
      bodyStyle={{
        ...styles.modalBodyStyle,
        maxHeight: "70vh",
        overflowY: "auto",
        padding: "16px",
      }}
      headerStyle={styles.modalHeaderStyle}
      className={darkMode ? "dark-calculate-rent-modal" : ""}
      okButtonProps={{
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
        <Form.Item
          label={t("roomNumber")}
          name="roomNumber"
          rules={[{ required: true, message: t("pleaseSelectRoom") }]}
        >
          <Select
            placeholder={t("selectRoom")}
            onChange={handleRoomChange}
            value={selectRoom}
            style={styles.inputStyle}
            dropdownStyle={
              darkMode ? { backgroundColor: "#374151", color: "#f9fafb" } : {}
            }
          >
            {availableRooms.map((room) => (
              <Select.Option key={room._id} value={room._id}>
                {room.roomNumber}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Utility Readings Information */}
        {selectRoom && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: darkMode ? "#1e40af" : "#dbeafe",
              borderRadius: "6px",
              fontSize: "13px",
              color: darkMode ? "#bfdbfe" : "#1e40af",
            }}
          >
            <strong>ℹ️ {t("utilityReadingsNote")}</strong>
            <br />
            {t("utilityReadingsDescription")}
          </div>
        )}

        <Form.Item label={t("electricalBill")}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "12px",
                  color: darkMode ? "#9ca3af" : "#6b7280",
                }}
              >
                {t("previousReading")}
              </label>
              <Input
                style={styles.readOnlyStyle}
                value={
                  selectRoom
                    ? (
                        availableRooms.find((r) => r._id === selectRoom)
                          ?.previousElectricityReading || 0
                      ).toString()
                    : "0"
                }
                readOnly
                addonAfter="kWh"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "12px",
                  color: darkMode ? "#9ca3af" : "#6b7280",
                }}
              >
                {t("currentReading")}
              </label>
              <Input
                style={styles.readOnlyStyle}
                value={
                  selectRoom
                    ? (
                        availableRooms.find((r) => r._id === selectRoom)
                          ?.currentElectricityReading || 0
                      ).toString()
                    : "0"
                }
                readOnly
                addonAfter="kWh"
              />
            </div>
          </div>
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              backgroundColor: darkMode ? "#374151" : "#f3f4f6",
              borderRadius: "4px",
              fontSize: "14px",
              color: darkMode ? "#f9fafb" : "#374151",
            }}
          >
            <strong>{t("consumption")}: </strong>
            {selectRoom
              ? Math.max(
                  0,
                  (availableRooms.find((r) => r._id === selectRoom)
                    ?.currentElectricityReading || 0) -
                    (availableRooms.find((r) => r._id === selectRoom)
                      ?.previousElectricityReading || 0)
                ).toString() + " kWh"
              : "0 kWh"}
            <span style={{ marginLeft: "16px" }}>
              <strong>{t("amount")}: </strong>
              {formatPrice(calculateElectricalPrice())}
            </span>
          </div>
        </Form.Item>

        <Form.Item label={t("waterBill")}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "12px",
                  color: darkMode ? "#9ca3af" : "#6b7280",
                }}
              >
                {t("previousReading")}
              </label>
              <Input
                style={styles.readOnlyStyle}
                value={
                  selectRoom
                    ? (
                        availableRooms.find((r) => r._id === selectRoom)
                          ?.previousWaterReading || 0
                      ).toString()
                    : "0"
                }
                readOnly
                addonAfter="m³"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "12px",
                  color: darkMode ? "#9ca3af" : "#6b7280",
                }}
              >
                {t("currentReading")}
              </label>
              <Input
                style={styles.readOnlyStyle}
                value={
                  selectRoom
                    ? (
                        availableRooms.find((r) => r._id === selectRoom)
                          ?.currentWaterReading || 0
                      ).toString()
                    : "0"
                }
                readOnly
                addonAfter="m³"
              />
            </div>
          </div>
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              backgroundColor: darkMode ? "#374151" : "#f3f4f6",
              borderRadius: "4px",
              fontSize: "14px",
              color: darkMode ? "#f9fafb" : "#374151",
            }}
          >
            <strong>{t("consumption")}: </strong>
            {selectRoom
              ? Math.max(
                  0,
                  (availableRooms.find((r) => r._id === selectRoom)
                    ?.currentWaterReading || 0) -
                    (availableRooms.find((r) => r._id === selectRoom)
                      ?.previousWaterReading || 0)
                ).toString() + " m³"
              : "0 m³"}
            <span style={{ marginLeft: "16px" }}>
              <strong>{t("amount")}: </strong>
              {formatPrice(calculateWaterPrice())}
            </span>
          </div>
        </Form.Item>

        {/* Additional Fees Section */}
        <Form.Item
          label={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>{t("additionalFees")}</span>
              {previousMonth && previousYear && (
                <span style={{ ...styles.fromMonthStyle, marginLeft: "10px" }}>
                  {t("fromMonth")} {previousMonth}/{previousYear}
                </span>
              )}
            </div>
          }
        >
          {loadingFees ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <Spin tip={t("loadingFees")} />
            </div>
          ) : additionalFees && additionalFees.length > 0 ? (
            <Table
              dataSource={additionalFees}
              pagination={false}
              rowKey="key"
              size="small"
              bordered
              style={styles.tableStyle}
            >
              <Table.Column
                title={t("feeName")}
                dataIndex="feeName"
                render={(text) => <span>{text}</span>}
                style={styles.tableHeaderStyle}
              />
              <Table.Column
                title={t("amount")}
                dataIndex="feeAmount"
                render={(amount) => renderAmountColumn(amount)}
                align="right"
                style={styles.tableHeaderStyle}
              />
            </Table>
          ) : (
            <Empty
              description={
                <span style={{ color: darkMode ? "#d1d5db" : "#6b7280" }}>
                  {t("noAdditionalFees")}
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ margin: "10px 0" }}
            />
          )}
        </Form.Item>

        {/* Room Price with updated formatting */}
        <Form.Item label={t("roomPrice")}>
          <Input
            value={formatPrice(roomPrice, { showFullFormat: true })}
            readOnly
            style={styles.readOnlyStyle}
          />
        </Form.Item>

        {/* Total Amount with updated formatting */}
        <Form.Item label={t("totalAmount")}>
          <Input
            value={formatPrice(totalAmount, { showFullFormat: true })}
            readOnly
            style={styles.totalAmountStyle}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CalculateRent;
