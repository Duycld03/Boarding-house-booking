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
} from "antd";
import {
  WalletOutlined,
  CreditCardOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

function DepositRefundPopup({
  visible,
  setVisible,
  depositRefundData,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation("depositRefundRequest");

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await acceptRefundRequestForOwner(
        depositRefundData._id,
        values
      );
      console.log(response);

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
        <div className="flex items-center space-x-4">
          <DollarOutlined className="text-green-500 text-5xl" />
          <span className="text-4xl font-bold">
            {t("depositRefundTitle") || "Deposit Refund Payment"}
          </span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
      centered
    >
      <Spin spinning={loading}>
        <div className="space-y-8">
          {/* Refund Information */}
          <Card className="border-0 bg-gray-50">
            <div className="text-center">
              <Text type="secondary" className="block mb-6 text-3xl font-bold">
                {t("refundInformation") || "Refund Information"}
              </Text>

              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center">
                  <Text className="text-3xl font-semibold">
                    {t("roomNumber") || "Room"}:
                  </Text>
                  <Text strong className="text-2xl">
                    {depositRefundData?.roomNumber || "N/A"}
                  </Text>
                </div>

                <div className="flex justify-between items-center">
                  <Text className="text-2xl font-semibold">
                    {t("boardingHouseName") || "Boarding House"}:
                  </Text>
                  <Text strong className="text-2xl">
                    {depositRefundData?.boardingHouseName || "N/A"}
                  </Text>
                </div>
              </div>

              <div className="p-6 bg-green-50 rounded-lg">
                <Text
                  type="secondary"
                  className="block text-2xl font-bold mb-5"
                >
                  {t("amountRefunded") || "Amount to Refund"}
                </Text>
                <Text className="text-green-600 text-5xl font-semibold">
                  {formatAmount(
                    depositRefundData?.amountRefunded || 0,
                    i18n.language
                  )}
                </Text>
              </div>
            </div>
          </Card>

          {/* Payment Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ paymentMethod: "vnpay" }}
          >
            <Form.Item
              label={
                <span className="text-2xl font-bold">
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
                <Row gutter={[20, 20]}>
                  <Col span={12}>
                    <Radio value="vnpay" className="w-full">
                      <div className="flex items-center justify-center p-2 border-2 rounded-lg hover:bg-blue-50 transition-colors">
                        <CreditCardOutlined className="text-blue-500 text-5xl mr-4" />
                        <Text strong className="text-2xl">
                          VNPay
                        </Text>
                      </div>
                    </Radio>
                  </Col>

                  <Col span={12}>
                    <Radio value="momo" className="w-full">
                      <div className="flex items-center justify-center p-2 border-2 rounded-lg hover:bg-pink-50 transition-colors">
                        <WalletOutlined className="text-pink-500 text-5xl mr-4" />
                        <Text strong className="text-2xl">
                          MoMo
                        </Text>
                      </div>
                    </Radio>
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item>

            {/* Action Buttons */}
            <Row gutter={[20, 20]} className="mt-10">
              <Col span={12}>
                <Button
                  size="large"
                  block
                  onClick={handleCancel}
                  disabled={loading}
                  className="h-16 text-2xl font-bold"
                >
                  {t("cancel") || "Cancel"}
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  size="large"
                  block
                  htmlType="submit"
                  loading={loading}
                  icon={<CheckCircleOutlined />}
                  className="h-16 text-2xl font-bold"
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
