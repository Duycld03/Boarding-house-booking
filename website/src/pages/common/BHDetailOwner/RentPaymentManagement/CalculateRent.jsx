import React, { useEffect, useState, useContext } from "react";
import { Modal, Form, Input, Table, Select, Spin, Empty } from "antd";
import { getAvailableRooms } from "@/api/ownerUser/roomAPI";
import { toast } from "react-toastify";
import { getElectricalAndWaterPrice } from "@/api/ownerUser/boardingHouseAPI";
import { calculateMonthlyBill } from "@/api/ownerUser/paymentBillAPI";
import { getRoomAdditionFeeForMonthlyCalculate } from "@/api/staffUser/roomAdditionFee";
import { useTheme } from "@/context/themeContext";
import { useTranslation } from "react-i18next";
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
  const [electricalBill, setElectricalBill] = useState({
    oldNumber: 0,
    newNumber: 0,
  });
  const [waterBill, setWaterBill] = useState({ oldNumber: 0, newNumber: 0 });
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
  const { formatPrice, formatNumber } = useFormatAmount(i18n.language);

  const onClose = () => {
    setVisible(false);
    setAdditionalFees([]);
    setElectricalBill({ oldNumber: 0, newNumber: 0 });
    setWaterBill({ oldNumber: 0, newNumber: 0 });
    setSelectRoom(null);
    form.resetFields();
  };

  const onOk = async () => {
    const values = form.getFieldsValue();

    if (
      values.roomNumber === undefined ||
      electricalBill.newNumber === undefined ||
      waterBill.newNumber === undefined ||
      electricalBill.oldNumber === undefined ||
      waterBill.oldNumber === undefined
    ) {
      toast.error(t("fillAllFields"));
      return;
    }

    if (
      electricalBill.oldNumber < 0 ||
      electricalBill.newNumber < 0 ||
      waterBill.oldNumber < 0 ||
      waterBill.newNumber < 0
    ) {
      toast.error(t("noNegativeNumbers"));
      return;
    }

    if (
      electricalBill.newNumber < electricalBill.oldNumber ||
      waterBill.newNumber < waterBill.oldNumber
    ) {
      toast.error(t("newGreaterThanOld"));
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
      electricalBill: {
        oldNumber: electricalBill.oldNumber,
        newNumber: electricalBill.newNumber,
        quantityConsumed: electricalBill.newNumber - electricalBill.oldNumber,
        totalAmount: calculateElectricalPrice(),
        price: electricalBillPrice,
      },
      waterBill: {
        oldNumber: waterBill.oldNumber,
        newNumber: waterBill.newNumber,
        quantityConsumed: waterBill.newNumber - waterBill.oldNumber,
        totalAmount: calculateWaterPrice(),
        price: waterBillPrice,
      },
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

  const calculateElectricalPrice = () =>
    Math.max(
      (electricalBill.newNumber - electricalBill.oldNumber) *
        electricalBillPrice,
      0
    );

  const calculateWaterPrice = () =>
    Math.max((waterBill.newNumber - waterBill.oldNumber) * waterBillPrice, 0);

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
    electricalBill,
    waterBill,
    electricalBillPrice,
    waterBillPrice,
    additionalFees,
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
        // Set room price and readings
        setRoomPrice(selectedRoom?.roomTypeId?.price);
        setElectricalBill({
          oldNumber: selectedRoom.previousElectricityReading,
          newNumber: 0,
        });
        setWaterBill({
          oldNumber: selectedRoom.previousWaterReading,
          newNumber: 0,
        });

        // Fetch additional fees for this room
        fetchAdditionalFees(selectRoom);
      }
    }
  }, [selectRoom]);

  const handleRoomChange = (value) => {
    setSelectRoom(value);
    form.setFieldsValue({ roomNumber: value });
  };

  // Updated getStyles function with colors from your tailwind.config.js
  const getStyles = () => {
    return {
      modalBodyStyle: darkMode
        ? { backgroundColor: "#111827", color: "#f9fafb" } // Using background.dark and text.dark from your theme
        : { backgroundColor: "#ffffff" }, // Using background.light

      modalHeaderStyle: darkMode
        ? {
            backgroundColor: "#0f172a",
            borderBottom: "1px solid #1f2937",
            color: "#f9fafb",
          }
        : {
            borderBottom: "1px solid #e5e7eb",
          },

      inputStyle: darkMode
        ? {
            backgroundColor: "#1f2937",
            color: "#f9fafb",
            borderColor: "#374151",
          }
        : { backgroundColor: "#f9fafb" },

      readOnlyStyle: darkMode
        ? {
            backgroundColor: "#1f2937",
            color: "#f9fafb",
            borderColor: "#374151",
            fontWeight: "bold",
          }
        : {
            backgroundColor: "#f8fafc",
            fontWeight: "bold",
          },

      totalAmountStyle: darkMode
        ? {
            backgroundColor: "#1e3a8a", // Darker blue that works better with dark theme
            color: "#93c5fd", // Lighter blue for better contrast
            fontWeight: "bold",
            fontSize: "16px",
            borderColor: "#2563eb", // primary color
          }
        : {
            backgroundColor: "#eff6ff",
            fontWeight: "bold",
            color: "#3b82f6", // primary color from theme
            fontSize: "16px",
            borderColor: "#bfdbfe",
          },

      fromMonthStyle: darkMode
        ? { fontStyle: "italic", color: "#9ca3af" } // Lighter gray for dark mode
        : { fontStyle: "italic", color: "#6b7280" }, // Darker gray for light mode

      tableHeaderStyle: darkMode
        ? {
            backgroundColor: "#1f2937",
            color: "#f9fafb",
            borderColor: "#374151",
          }
        : {},

      tableStyle: darkMode
        ? {
            backgroundColor: "#111827",
            borderColor: "#374151",
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

      if (visible && darkMode) {
        // Create style element for dark mode styles
        const style = document.createElement("style");
        style.id = "calculate-rent-styles";
        style.innerHTML = `
          .ant-input-group-addon {
            background-color: #374151 !important;
            color: #d1d5db !important;
            border-color: #4b5563 !important;
          }
          .ant-table-cell {
            color: #f9fafb !important;
          }
          .ant-table-thead > tr > th {
            background-color: #1f2937 !important;
            color: #f9fafb !important;
            border-color: #374151 !important;
          }
          .ant-table-tbody > tr > td {
            border-color: #374151 !important;
          }
          .ant-empty-description {
            color: #d1d5db !important;
          }
        `;
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
      bodyStyle={styles.modalBodyStyle}
      headerStyle={styles.modalHeaderStyle}
      okButtonProps={{
        style: darkMode ? { background: "#1890ff" } : {},
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
            style={darkMode ? { background: "#141414" } : {}}
          >
            {availableRooms.map((room) => (
              <Select.Option key={room._id} value={room._id}>
                {room.roomNumber}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label={t("electricalBill")}>
          <Input.Group compact>
            <Input
              style={{
                width: "48%",
                marginRight: "4%",
                ...(darkMode
                  ? {
                      backgroundColor: "#1f2937",
                      color: "#f9fafb",
                      borderColor: "#374151",
                    }
                  : {}),
              }}
              placeholder={t("oldNumber")}
              type="number"
              value={electricalBill.oldNumber}
              onChange={(e) =>
                setElectricalBill({
                  ...electricalBill,
                  oldNumber: Number(e.target.value),
                })
              }
              addonBefore={
                <span style={darkMode ? { color: "#d1d5db" } : {}}>
                  {t("old")}
                </span>
              }
            />
            <Input
              style={{
                width: "48%",
                ...(darkMode
                  ? {
                      backgroundColor: "#1f2937",
                      color: "#f9fafb",
                      borderColor: "#374151",
                    }
                  : {}),
              }}
              placeholder={t("newNumber")}
              type="number"
              value={electricalBill.newNumber}
              onChange={(e) =>
                setElectricalBill({
                  ...electricalBill,
                  newNumber: Number(e.target.value),
                })
              }
              addonBefore={
                <span style={darkMode ? { color: "#d1d5db" } : {}}>
                  {t("new")}
                </span>
              }
            />
          </Input.Group>
        </Form.Item>

        <Form.Item label={t("waterBill")}>
          <Input.Group compact>
            <Input
              style={{
                width: "48%",
                marginRight: "4%",
                ...(darkMode
                  ? {
                      backgroundColor: "#1f2937",
                      color: "#f9fafb",
                      borderColor: "#374151",
                    }
                  : {}),
              }}
              placeholder={t("oldNumber")}
              type="number"
              value={waterBill.oldNumber}
              onChange={(e) =>
                setWaterBill({
                  ...waterBill,
                  oldNumber: Number(e.target.value),
                })
              }
              addonBefore={
                <span style={darkMode ? { color: "#d1d5db" } : {}}>
                  {t("old")}
                </span>
              }
            />
            <Input
              style={{
                width: "48%",
                ...(darkMode
                  ? {
                      backgroundColor: "#1f2937",
                      color: "#f9fafb",
                      borderColor: "#374151",
                    }
                  : {}),
              }}
              placeholder={t("newNumber")}
              type="number"
              value={waterBill.newNumber}
              onChange={(e) =>
                setWaterBill({
                  ...waterBill,
                  newNumber: Number(e.target.value),
                })
              }
              addonBefore={
                <span style={darkMode ? { color: "#d1d5db" } : {}}>
                  {t("new")}
                </span>
              }
            />
          </Input.Group>
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
