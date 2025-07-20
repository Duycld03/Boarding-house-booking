import { acceptRefundRequestForOwner } from "@/api/ownerUser/refundRequestAPI";
import formatAmount from "@/utils/formatAmount";
import {
  Form,
  Modal,
  Radio,
  Card,
  Typography,
  Row,
  Col,
  Button,
  Spin,
  Input,
  InputNumber,
  Space,
  Divider,
  Alert,
  Popconfirm,
} from "antd";
import {
  WalletOutlined,
  CreditCardOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import "./DepositRefundPopup.css";

const { Title, Text } = Typography;

function DepositRefundPopup({
  visible,
  setVisible,
  depositRefundData,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [damageAssessment, setDamageAssessment] = useState([]);
  const { t, i18n } = useTranslation("depositRefundRequest");
  const { darkMode } = useTheme();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setDamageAssessment([]);
    }
  }, [visible, form]);

  // Calculate total damage amount
  const totalDamageAmount = damageAssessment.reduce(
    (total, item) => total + (item.estimatedCost || 0),
    0
  );

  // Calculate actual refund amount
  const originalDepositAmount = depositRefundData?.originalDepositAmount || 0;
  const actualRefundAmount = Math.max(
    0,
    originalDepositAmount - totalDamageAmount
  );

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
    setDamageAssessment([]);
  };

  // Add new damage assessment item
  const addDamageItem = () => {
    setDamageAssessment([
      ...damageAssessment,
      {
        id: Date.now(),
        damageName: "",
        estimatedCost: 0,
      },
    ]);
  };

  // Remove damage assessment item
  const removeDamageItem = (id) => {
    setDamageAssessment(damageAssessment.filter((item) => item.id !== id));
  };

  // Update damage assessment item
  const updateDamageItem = (id, field, value) => {
    setDamageAssessment(
      damageAssessment.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Validate damage assessment
  const validateDamageAssessment = () => {
    if (damageAssessment.length === 0) {
      return true; // No damage assessment is valid
    }

    for (const item of damageAssessment) {
      if (!item.damageName || item.damageName.trim() === "") {
        toast.error(t("damageNameRequired") || "Damage name is required");
        return false;
      }
      if (item.estimatedCost === null || item.estimatedCost < 0) {
        toast.error(
          t("validCostRequired") || "Valid estimated cost is required"
        );
        return false;
      }
    }

    return true;
  };

  const onFinish = async (values) => {
    // Validate damage assessment
    if (!validateDamageAssessment()) {
      return;
    }

    // Check if refund amount is positive
    if (actualRefundAmount <= 0) {
      toast.error(
        t("noRefundAmount") ||
          "No amount to refund. Total damage amount equals or exceeds deposit amount."
      );
      return;
    }

    setLoading(true);
    try {
      // Prepare damage assessment data (remove id field)
      const damageAssessmentData = damageAssessment.map(({ id, ...item }) => ({
        damageName: item.damageName.trim(),
        estimatedCost: item.estimatedCost || 0,
      }));

      const requestData = {
        ...values,
        damageAssessment: damageAssessmentData,
      };

      const response = await acceptRefundRequestForOwner(
        depositRefundData._id,
        requestData
      );

      if (response.payUrl) {
        window.location.href = response.payUrl;
      } else {
        toast.success(
          t("refundRequestAcceptedSuccessfully") ||
            "Refund request accepted successfully!"
        );
        handleCancel();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error accepting refund request:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        t("errorAcceptingRefundRequest") ||
        "Error accepting refund request";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <DollarOutlined className="text-green-500" />
          <span
            className={`font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
          >
            {t("depositRefundTitle") || "Deposit Refund Payment"}
          </span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
      centered
      className={darkMode ? "dark-modal" : ""}
      style={{ maxWidth: "90vw" }}
    >
      <Spin spinning={loading}>
        <div className={`space-y-2 ${darkMode ? "dark" : ""} overflow-hidden`}>
          {/* Refund Information */}
          <Card
            className={`border-0 ${
              darkMode ? "dark:bg-gray-800" : "bg-gray-50"
            }`}
          >
            <div className="text-center">
              <Text
                type="secondary"
                className={`block mb-2 font-bold ${
                  darkMode ? "text-gray-300" : ""
                }`}
              >
                {t("refundInformation") || "Refund Information"}
              </Text>

              <div className="space-y-1 mb-1">
                <div className="flex justify-between items-center">
                  <Text
                    className={`font-semibold ${
                      darkMode ? "text-gray-300" : ""
                    }`}
                  >
                    {t("roomNumber") || "Room"}:
                  </Text>
                  <Text strong className={darkMode ? "text-white" : ""}>
                    {depositRefundData?.roomNumber || "N/A"}
                  </Text>
                </div>

                <div className="flex justify-between items-center">
                  <Text
                    className={`font-semibold ${
                      darkMode ? "text-gray-300" : ""
                    }`}
                  >
                    {t("boardingHouseName") || "Boarding House"}:
                  </Text>
                  <Text strong className={darkMode ? "text-white" : ""}>
                    {depositRefundData?.boardingHouseName || "N/A"}
                  </Text>
                </div>

                <div className="flex justify-between items-center">
                  <Text
                    className={`font-semibold ${
                      darkMode ? "text-gray-300" : ""
                    }`}
                  >
                    {t("originalDepositAmount") || "Original Deposit"}:
                  </Text>
                  <Text strong className="text-blue-600">
                    {formatAmount(originalDepositAmount, i18n.language)}
                  </Text>
                </div>

                <div className="flex justify-between items-center">
                  <Text
                    className={`font-semibold ${
                      darkMode ? "text-gray-300" : ""
                    }`}
                  >
                    {t("totalDamageAmount") || "Total Damage"}:
                  </Text>
                  <Text strong className="text-red-600">
                    {formatAmount(totalDamageAmount, i18n.language)}
                  </Text>
                </div>
              </div>
            </div>
          </Card>

          {/* Damage Assessment Section */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <span className={darkMode ? "text-white" : ""}>
                  {t("damageAssessment") || "Damage Assessment"}
                </span>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addDamageItem}
                  size="medium"
                >
                  {t("addDamage") || "Add Damage"}
                </Button>
              </div>
            }
            className={darkMode ? "dark:bg-gray-800 dark:border-gray-700" : ""}
          >
            {damageAssessment.length === 0 ? (
              <div className="text-center py-2">
                <Text
                  type="secondary"
                  className={darkMode ? "text-gray-400" : ""}
                >
                  {t("noDamageAssessment") ||
                    "No damage assessment added. Click 'Add Damage' to add items."}
                </Text>
              </div>
            ) : (
              <div className="space-y-2">
                {damageAssessment.map((item, index) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-2 ${
                      darkMode
                        ? "dark:bg-gray-700 dark:border-gray-600"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Text strong className={darkMode ? "text-white" : ""}>
                        {t("damageItem") || "Damage Item"} #{index + 1}
                      </Text>
                      <Popconfirm
                        title={
                          t("confirmRemove") ||
                          "Are you sure you want to remove this item?"
                        }
                        onConfirm={() => removeDamageItem(item.id)}
                        okText={t("yes") || "Yes"}
                        cancelText={t("no") || "No"}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                        />
                      </Popconfirm>
                    </div>

                    <Row gutter={[8, 8]}>
                      <Col xs={24} sm={14}>
                        <div>
                          <Text
                            strong
                            className={`block mb-1 ${
                              darkMode ? "text-white" : ""
                            }`}
                          >
                            {t("damageName") || "Damage Name"}
                          </Text>
                          <Input
                            placeholder={
                              t("enterDamageName") || "Enter damage name"
                            }
                            value={item.damageName}
                            onChange={(e) =>
                              updateDamageItem(
                                item.id,
                                "damageName",
                                e.target.value
                              )
                            }
                            maxLength={100}
                            className={
                              darkMode
                                ? "dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                : ""
                            }
                          />
                        </div>
                      </Col>
                      <Col xs={24} sm={10}>
                        <div>
                          <Text
                            strong
                            className={`block mb-1 ${
                              darkMode ? "text-white" : ""
                            }`}
                          >
                            {t("estimatedCost") || "Estimated Cost"}
                          </Text>
                          <InputNumber
                            placeholder={t("enterCost") || "Enter cost"}
                            value={item.estimatedCost}
                            onChange={(value) =>
                              updateDamageItem(item.id, "estimatedCost", value)
                            }
                            min={0}
                            max={10000000}
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) =>
                              value?.replace(/\$\s?|(,*)/g, "")
                            }
                            style={{ width: "100%", minWidth: 0 }}
                            className={
                              darkMode
                                ? "dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                : ""
                            }
                          />
                        </div>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Payment Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ paymentMethod: "vnpay" }}
            className={darkMode ? "dark-form" : ""}
          >
            <Form.Item
              label={
                <span className={`font-bold ${darkMode ? "text-white" : ""}`}>
                  {t("selectPaymentMethod") || "Select Payment Method"}
                </span>
              }
              name="paymentMethod"
              rules={[
                {
                  required: true,
                  message:
                    t("pleaseSelectPaymentMethod") ||
                    "Please select a payment method",
                },
              ]}
            >
              <Radio.Group className="w-full">
                <Row gutter={[8, 8]}>
                  <Col xs={24} sm={12}>
                    <Radio value="vnpay" className="w-full">
                      <div
                        className={`flex items-center justify-center p-2 border-2 rounded-lg hover:bg-blue-50 transition-colors ${
                          darkMode
                            ? "dark:border-gray-600 dark:hover:bg-blue-900"
                            : ""
                        }`}
                      >
                        <CreditCardOutlined className="text-blue-500 text-xl mr-2" />
                        <Text strong className={darkMode ? "text-white" : ""}>
                          VNPay
                        </Text>
                      </div>
                    </Radio>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Radio value="momo" className="w-full">
                      <div
                        className={`flex items-center justify-center p-2 border-2 rounded-lg hover:bg-pink-50 transition-colors ${
                          darkMode
                            ? "dark:border-gray-600 dark:hover:bg-pink-900"
                            : ""
                        }`}
                      >
                        <WalletOutlined className="text-pink-500 text-xl mr-2" />
                        <Text strong className={darkMode ? "text-white" : ""}>
                          MoMo
                        </Text>
                      </div>
                    </Radio>
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item>

            {/* Action Buttons */}
            <Row gutter={[8, 8]} className="mt-2">
              <Col xs={24} sm={12}>
                <Button
                  size="medium"
                  block
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {t("cancel") || "Cancel"}
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button
                  type="primary"
                  size="medium"
                  block
                  htmlType="submit"
                  loading={loading}
                  icon={<CheckCircleOutlined />}
                  disabled={actualRefundAmount <= 0}
                >
                  {loading
                    ? t("processing") || "Processing..."
                    : t("processRefund") || "Process Refund"}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Spin>
    </Modal>
  );
}

export default DepositRefundPopup;
