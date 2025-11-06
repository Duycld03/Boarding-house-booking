import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Spin } from "antd";
import { toast } from "react-toastify";
import {
  getPaymentBillById,
  updatePaymentBill,
} from "@/api/staffUser/paymentBillAPI"; // Changed to ownerUser
import { getElectricalAndWaterPrice } from "@/api/ownerUser/boardingHouseAPI";
import { useTheme } from "@/context/themeContext";
import { useTranslation } from "react-i18next";
import formatAmount, { useFormatAmount } from "@/utils/formatAmount";

const UpdateRentModal = ({
  visible,
  setVisible,
  paymentBill,
  boardingHouseId,
  fetchRentPaymentData,
}) => {
  const { t, i18n } = useTranslation("rentPayment");
  const { darkMode } = useTheme();
  const [form] = Form.useForm();
  const { formatPrice } = useFormatAmount(i18n.language);

  const [electricalBill, setElectricalBill] = useState({
    oldNumber: 0,
    newNumber: 0,
  });
  const [waterBill, setWaterBill] = useState({
    oldNumber: 0,
    newNumber: 0,
  });
  const [waterBillPrice, setWaterBillPrice] = useState(0);
  const [electricalBillPrice, setElectricalBillPrice] = useState(0);
  const [roomPrice, setRoomPrice] = useState(0);
  const [additionalFeesTotal, setAdditionalFeesTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [billDetails, setBillDetails] = useState(null);

  // Calculate prices for utilities
  const calculateElectricalPrice = () =>
    Math.max(
      (electricalBill.newNumber - electricalBill.oldNumber) *
        electricalBillPrice,
      0
    );

  const calculateWaterPrice = () =>
    Math.max((waterBill.newNumber - waterBill.oldNumber) * waterBillPrice, 0);

  // Fetch electric and water prices if not available in the bill
  const fetchElectricAndWaterPrice = async () => {
    try {
      const res = await getElectricalAndWaterPrice(boardingHouseId);
      setElectricalBillPrice(Number(res.electricityPrice));
      setWaterBillPrice(Number(res.waterPrice));
    } catch (error) {
      toast.error(t("errorFetchingPrices"));
    }
  };

  // Fetch payment bill details
  const fetchPaymentBillDetails = async (id) => {
    setInitializing(true);
    try {
      const details = await getPaymentBillById(id);

      // Store the complete bill details
      setBillDetails(details);

      // Simply use the room price returned by the backend
      setRoomPrice(details.roomPrice || 0);

      // Set additional fees
      setAdditionalFeesTotal(details.additionalFeeTotal || 0);

      // Set electrical bill data
      if (details.electricalBill) {
        setElectricalBill({
          oldNumber: Number(details.electricalBill.oldNumber || 0),
          newNumber: Number(details.electricalBill.newNumber || 0),
        });

        // Use price from the bill
        if (details.electricalBill.price) {
          setElectricalBillPrice(Number(details.electricalBill.price));
        }
      }

      // Set water bill data
      if (details.waterBill) {
        setWaterBill({
          oldNumber: Number(details.waterBill.oldNumber || 0),
          newNumber: Number(details.waterBill.newNumber || 0),
        });

        // Use price from the bill
        if (details.waterBill.price) {
          setWaterBillPrice(Number(details.waterBill.price));
        }
      }

      // Set total payment amount
      setTotalAmount(details.paymentAmount || 0);
    } catch (error) {
      toast.error(t("errorFetchingBill"));
    } finally {
      setInitializing(false);
    }
  };

  // Initialize when modal becomes visible
  useEffect(() => {
    if (visible && paymentBill?._id) {
      // Reset states
      setElectricalBill({ oldNumber: 0, newNumber: 0 });
      setWaterBill({ oldNumber: 0, newNumber: 0 });
      setWaterBillPrice(0);
      setElectricalBillPrice(0);
      setRoomPrice(0);
      setAdditionalFeesTotal(0);
      setTotalAmount(0);

      // Fetch full bill details
      fetchPaymentBillDetails(paymentBill._id);

      // Fetch prices as fallback
      fetchElectricAndWaterPrice();
    }
  }, [visible, paymentBill]);

  // Calculate updated total when meter readings change
  useEffect(() => {
    if (!initializing && billDetails) {
      // Calculate new costs
      const newElectricalCost = calculateElectricalPrice();
      const newWaterCost = calculateWaterPrice();

      // Calculate new total using the room price from backend directly
      const newTotal =
        roomPrice + newElectricalCost + newWaterCost + additionalFeesTotal;
      setTotalAmount(newTotal);
    }
  }, [
    electricalBill,
    waterBill,
    electricalBillPrice,
    waterBillPrice,
    roomPrice,
    additionalFeesTotal,
    initializing,
    billDetails,
  ]);

  // Close handler
  const onClose = () => {
    setVisible(false);
    form.resetFields();
    setBillDetails(null);
  };

  // Submit handler
  const onOk = async () => {
    if (!billDetails || !billDetails._id) {
      toast.error(t("invalidPaymentBill"));
      return;
    }

    if (!electricalBillPrice || !waterBillPrice) {
      toast.error(t("pricesNotLoaded"));
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

    // Prepare payload
    const payload = {
      paymentBillId: billDetails._id,
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
      paymentAmount: totalAmount,
    };

    setLoading(true);
    try {
      const res = await updatePaymentBill(paymentBill._id, payload);
      toast.success(res.message || t("updateSuccess"));
      fetchRentPaymentData(); // Refresh the parent data
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || t("updateError"));
    } finally {
      setLoading(false);
    }
  };

  // Styles for the modal
  const getStyles = () => {
    return {
      modalBodyStyle: darkMode
        ? { backgroundColor: "#111827", color: "#f9fafb" }
        : { backgroundColor: "#ffffff" },
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
            backgroundColor: "#1e3a8a",
            color: "#93c5fd",
            fontWeight: "bold",
            fontSize: "16px",
            borderColor: "#2563eb",
          }
        : {
            backgroundColor: "#eff6ff",
            fontWeight: "bold",
            color: "#3b82f6",
            fontSize: "16px",
            borderColor: "#bfdbfe",
          },
    };
  };

  const styles = getStyles();

  // Add minimal CSS for dark mode and scroll control
  useEffect(() => {
    if (visible) {
      const style = document.createElement("style");
      style.id = "update-rent-modal-styles";
      style.innerHTML = `
        .update-rent-modal .ant-modal-content {
          ${
            darkMode
              ? `
            background-color: #111827 !important;
            border: 1px solid #374151 !important;
          `
              : ""
          }
        }
        .update-rent-modal .ant-modal-header {
          ${
            darkMode
              ? `
            background-color: #0f172a !important;
            border-bottom: 1px solid #1f2937 !important;
          `
              : ""
          }
        }
        .update-rent-modal .ant-modal-title {
          ${darkMode ? `color: #f9fafb !important;` : ""}
        }
        .update-rent-modal .ant-modal-close {
          ${darkMode ? `color: #f9fafb !important;` : ""}
        }
        .update-rent-modal .ant-modal-close:hover {
          ${darkMode ? `color: #d1d5db !important;` : ""}
        }
        .update-rent-modal .ant-modal-footer {
          ${
            darkMode
              ? `
            background-color: #111827 !important;
            border-top: 1px solid #1f2937 !important;
          `
              : ""
          }
        }
        .update-rent-modal .ant-form-item-label > label {
          ${darkMode ? `color: #f9fafb !important;` : ""}
        }
        .update-rent-modal .ant-input-group-addon {
          ${
            darkMode
              ? `
            background-color: #374151 !important;
            color: #d1d5db !important;
            border-color: #4b5563 !important;
          `
              : ""
          }
        }
        .update-rent-modal .ant-input {
          ${
            darkMode
              ? `
            background-color: #1f2937 !important;
            color: #f9fafb !important;
            border-color: #374151 !important;
          `
              : ""
          }
        }
        .update-rent-modal .ant-input:hover {
          ${darkMode ? `border-color: #4b5563 !important;` : ""}
        }
        .update-rent-modal .ant-input:focus {
          ${
            darkMode
              ? `
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
          `
              : ""
          }
        }
        
        /* Hide all scrollbars */
        .update-rent-modal .ant-modal-body::-webkit-scrollbar {
          display: none !important;
        }
        .update-rent-modal .ant-modal-body {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .update-rent-modal::-webkit-scrollbar {
          display: none !important;
        }
        .update-rent-modal {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        
        /* Hide scrollbars for the modal wrapper */
        .ant-modal-wrap::-webkit-scrollbar {
          display: none !important;
        }
        .ant-modal-wrap {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        const existingStyle = document.getElementById(
          "update-rent-modal-styles"
        );
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [visible, darkMode]);

  if (!paymentBill) return null;

  return (
    <Modal
      title={t("updateRentPayment")}
      open={visible}
      onCancel={onClose}
      onOk={onOk}
      okText={t("update")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      destroyOnClose
      width={600}
      style={{
        top: 20,
      }}
      wrapClassName="update-rent-modal-wrap"
      bodyStyle={{
        ...styles.modalBodyStyle,
        padding: "12px 16px",
        maxHeight: "none",
        overflow: "visible",
      }}
      headerStyle={styles.modalHeaderStyle}
      className="update-rent-modal"
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
      {initializing ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spin size="large" tip={t("loading")} />
        </div>
      ) : (
        <Form
          layout="vertical"
          form={form}
          style={{ margin: 0, height: "100%" }}
        >
          <Form.Item
            label={t("roomInformation")}
            style={{ marginBottom: "8px" }}
          >
            <Input
              value={`${t("room")} ${
                billDetails?.roomNumber || paymentBill.roomNumber
              } - ${billDetails?.rentMonth || paymentBill.rentMonth}`}
              readOnly
              style={styles.readOnlyStyle}
            />
          </Form.Item>

          <Form.Item
            label={t("electricalBill")}
            style={{ marginBottom: "8px" }}
          >
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
                value={electricalBill.oldNumber.toString()}
                onChange={(e) => {
                  setElectricalBill({
                    ...electricalBill,
                    oldNumber: Number(e.target.value),
                  });
                }}
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
                value={electricalBill.newNumber.toString()}
                onChange={(e) => {
                  setElectricalBill({
                    ...electricalBill,
                    newNumber: Number(e.target.value),
                  });
                }}
                addonBefore={
                  <span style={darkMode ? { color: "#d1d5db" } : {}}>
                    {t("new")}
                  </span>
                }
              />
            </Input.Group>
          </Form.Item>

          <Form.Item label={t("waterBill")} style={{ marginBottom: "8px" }}>
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

          <Form.Item
            label={t("electricalBillAmount")}
            style={{ marginBottom: "8px" }}
          >
            <Input
              value={formatPrice(calculateElectricalPrice(), {
                showFullFormat: true,
              })}
              readOnly
              style={styles.readOnlyStyle}
            />
          </Form.Item>

          <Form.Item
            label={t("waterBillAmount")}
            style={{ marginBottom: "8px" }}
          >
            <Input
              value={formatPrice(calculateWaterPrice(), {
                showFullFormat: true,
              })}
              readOnly
              style={styles.readOnlyStyle}
            />
          </Form.Item>

          <Form.Item label={t("roomPrice")} style={{ marginBottom: "8px" }}>
            <Input
              value={formatPrice(roomPrice, { showFullFormat: true })}
              readOnly
              style={styles.readOnlyStyle}
            />
          </Form.Item>

          <Form.Item
            label={t("additionalFeeAmount")}
            style={{ marginBottom: "8px" }}
          >
            <Input
              value={formatPrice(additionalFeesTotal, { showFullFormat: true })}
              readOnly
              style={styles.readOnlyStyle}
            />
          </Form.Item>

          <Form.Item label={t("totalAmount")} style={{ marginBottom: "0px" }}>
            <Input
              value={formatPrice(totalAmount, { showFullFormat: true })}
              readOnly
              style={styles.totalAmountStyle}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default UpdateRentModal;
