import React, { useState, useEffect } from "react";
import {
  Modal,
  Steps,
  Form,
  Input,
  Radio,
  Checkbox,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Result,
} from "antd";
import {
  CreditCardOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

// Enhanced Payment Modal
const PaymentModal = ({
  showPaymentModal,
  setShowPaymentModal,
  selectedPlan,
  billingCycle,
  subscription,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Reset form và steps khi mở modal
  useEffect(() => {
    if (showPaymentModal) {
      setCurrentStep(0);
      setPaymentComplete(false);
      form.resetFields();
    }
  }, [showPaymentModal, form]);

  // Kiểm tra nếu là gia hạn hay nâng cấp
  const isRenewing = subscription && subscription.plan === selectedPlan?.key;
  const isUpgrading = subscription && subscription.plan !== selectedPlan?.key;

  // Tính toán thời hạn mới của subscription
  const calculateNewDates = () => {
    let startDate = new Date();
    let endDate;

    // Nếu đang gia hạn và subscription hiện tại còn hạn, kéo dài từ ngày hết hạn
    if (isRenewing && moment(subscription.endDate).isAfter(moment())) {
      startDate = new Date(subscription.endDate);
    }

    // Tính ngày kết thúc dựa trên billing cycle
    if (billingCycle === "monthly") {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Tính ngày gia hạn (1 tuần sau khi hết hạn)
    const graceEndDate = new Date(endDate);
    graceEndDate.setDate(graceEndDate.getDate() + 7);

    return {
      startDate: moment(startDate).format("MMM DD, YYYY"),
      endDate: moment(endDate).format("MMM DD, YYYY"),
      graceEndDate: moment(graceEndDate).format("MMM DD, YYYY"),
    };
  };

  const newDates = calculateNewDates();

  // Tính số tiền thanh toán dựa vào plan và billing cycle
  const calculatePrice = () => {
    if (!selectedPlan) return 0;

    let basePrice =
      billingCycle === "monthly"
        ? selectedPlan.monthlyPrice
        : selectedPlan.yearlyPrice;

    // Nếu là upgrade, tính phần chênh lệch còn lại của subscription cũ
    if (isUpgrading && subscription) {
      // Tính số ngày còn lại của subscription cũ
      const daysRemaining = moment(subscription.endDate).diff(moment(), "days");
      if (daysRemaining > 0) {
        // Tính giá trị còn lại của subscription cũ
        const currentPlan = plans.find((p) => p.key === subscription.plan);
        const oldPlanDailyRate = currentPlan
          ? billingCycle === "monthly"
            ? currentPlan.monthlyPrice / 30
            : currentPlan.yearlyPrice / 365
          : 0;
        const remainingValue = oldPlanDailyRate * daysRemaining;

        // Giảm trừ giá trị còn lại từ giá mới
        basePrice = Math.max(0, basePrice - remainingValue);
      }
    }

    return basePrice.toFixed(2);
  };

  const totalPrice = calculatePrice();

  const handleNext = () => {
    form
      .validateFields()
      .then(() => {
        setCurrentStep(currentStep + 1);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Mô phỏng API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Sau khi thanh toán thành công
      setPaymentComplete(true);
      setCurrentStep(3);
      setLoading(false);

      // Sau 3 giây đóng modal
      setTimeout(() => {
        setShowPaymentModal(false);
      }, 3000);
    } catch (error) {
      setLoading(false);
      console.error("Payment failed:", error);
    }
  };

  // Component hiển thị step Review
  const ReviewStep = () => (
    <div>
      <Alert
        message={isRenewing ? "Subscription Renewal" : "Plan Upgrade"}
        description={
          isRenewing
            ? `You are renewing your ${selectedPlan.name} plan for another ${
                billingCycle === "monthly" ? "month" : "year"
              }.`
            : `You are upgrading from ${subscription?.plan || "FREE"} to ${
                selectedPlan.name
              } plan.`
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div
            style={{
              background: "#f9f9f9",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <Title level={5}>Subscription Details</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary">Plan:</Text>
                <div
                  style={{
                    fontWeight: 600,
                    color: selectedPlan.color,
                  }}
                >
                  {selectedPlan.name}
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Billing Cycle:</Text>
                <div style={{ fontWeight: 600 }}>
                  {billingCycle === "monthly" ? "Monthly" : "Annual"}
                </div>
              </Col>
            </Row>
            <Divider style={{ margin: "12px 0" }} />
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary">Start Date:</Text>
                <div>{newDates.startDate}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Expiration Date:</Text>
                <div>{newDates.endDate}</div>
              </Col>
            </Row>
          </div>
        </Col>

        <Col span={24}>
          <div
            style={{
              background: "#f9f9f9",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <Title level={5}>Plan Features</Title>
            <ul style={{ paddingLeft: "20px" }}>
              {selectedPlan.features.map((feature, index) => (
                <li key={index} style={{ margin: "8px 0" }}>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </Col>

        <Col span={24}>
          <div
            style={{
              background: "#f9f9f9",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <Title level={5}>Payment Summary</Title>
            <Row justify="space-between">
              <Col>
                <Text>
                  {selectedPlan.name} Plan (
                  {billingCycle === "monthly" ? "Monthly" : "Annual"})
                </Text>
              </Col>
              <Col>
                <Text>
                  $
                  {billingCycle === "monthly"
                    ? selectedPlan.monthlyPrice
                    : selectedPlan.yearlyPrice}
                </Text>
              </Col>
            </Row>

            {isUpgrading && (
              <Row justify="space-between" style={{ marginTop: "8px" }}>
                <Col>
                  <Text>Credit from remaining subscription</Text>
                </Col>
                <Col>
                  <Text type="success">
                    $
                    {(billingCycle === "monthly"
                      ? selectedPlan.monthlyPrice
                      : selectedPlan.yearlyPrice) - totalPrice}
                  </Text>
                </Col>
              </Row>
            )}

            <Divider style={{ margin: "12px 0" }} />
            <Row justify="space-between">
              <Col>
                <Text strong>Total</Text>
              </Col>
              <Col>
                <Text strong>${totalPrice}</Text>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );

  // Các bước trong modal
  const steps = [
    {
      title: "Plan",
      content: (
        <div style={{ padding: "20px 0" }}>
          <div
            style={{
              padding: "24px",
              borderRadius: "12px",
              border: `2px solid ${selectedPlan?.color || "#1890ff"}`,
              marginBottom: "24px",
              background: `${selectedPlan?.color}08`,
            }}
          >
            <Title level={4} style={{ color: selectedPlan?.color }}>
              {selectedPlan?.name} Plan
            </Title>
            <Text>
              {billingCycle === "monthly" ? "Monthly" : "Annual"} billing
            </Text>
            <div
              style={{
                marginTop: "16px",
                fontSize: "24px",
                fontWeight: "700",
              }}
            >
              $
              {billingCycle === "monthly"
                ? selectedPlan?.monthlyPrice
                : selectedPlan?.yearlyPrice}
              <Text
                style={{
                  fontSize: "14px",
                  marginLeft: "4px",
                  fontWeight: "normal",
                }}
              >
                /{billingCycle === "monthly" ? "month" : "year"}
              </Text>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <Title level={5}>Plan Features:</Title>
            <ul style={{ paddingLeft: "20px" }}>
              {selectedPlan?.features.map((feature, index) => (
                <li key={index} style={{ margin: "8px 0" }}>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {subscription && (
            <Alert
              message={
                isRenewing
                  ? "Renewing your subscription"
                  : "Upgrading your plan"
              }
              description={
                isRenewing
                  ? `Your current subscription will be extended by ${
                      billingCycle === "monthly" ? "1 month" : "1 year"
                    }.`
                  : "Your new plan will take effect immediately. Any remaining time on your current plan will be credited toward your new subscription."
              }
              type="info"
              showIcon
              style={{ marginBottom: "24px" }}
            />
          )}

          <div style={{ textAlign: "right" }}>
            <Button type="primary" onClick={handleNext}>
              Continue to Payment
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: "Payment",
      content: (
        <div style={{ padding: "20px 0" }}>
          <Form form={form} layout="vertical">
            <div style={{ marginBottom: "24px" }}>
              <Title level={5}>Payment Method</Title>
              <Radio.Group
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: "100%" }}
              >
                <Radio.Button
                  value="credit_card"
                  style={{
                    width: "100%",
                    height: "auto",
                    marginBottom: "12px",
                    padding: "12px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <CreditCardOutlined
                      style={{ fontSize: "24px", marginRight: "12px" }}
                    />
                    <div>
                      <div style={{ fontWeight: "500" }}>Credit Card</div>
                      <div style={{ fontSize: "12px", color: "#888" }}>
                        Visa, Mastercard, American Express
                      </div>
                    </div>
                  </div>
                </Radio.Button>

                <Radio.Button
                  value="bank_transfer"
                  style={{
                    width: "100%",
                    height: "auto",
                    padding: "12px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <BankOutlined
                      style={{ fontSize: "24px", marginRight: "12px" }}
                    />
                    <div>
                      <div style={{ fontWeight: "500" }}>Bank Transfer</div>
                      <div style={{ fontSize: "12px", color: "#888" }}>
                        Pay directly from your bank account
                      </div>
                    </div>
                  </div>
                </Radio.Button>
              </Radio.Group>
            </div>

            {paymentMethod === "credit_card" && (
              <>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="cardName"
                      label="Cardholder Name"
                      rules={[
                        {
                          required: true,
                          message: "Please enter cardholder name",
                        },
                      ]}
                    >
                      <Input placeholder="Name on card" size="large" />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      name="cardNumber"
                      label="Card Number"
                      rules={[
                        { required: true, message: "Please enter card number" },
                      ]}
                    >
                      <Input placeholder="1234 5678 9012 3456" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="expiryDate"
                      label="Expiry Date"
                      rules={[
                        { required: true, message: "Please enter expiry date" },
                      ]}
                    >
                      <Input placeholder="MM/YY" size="large" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="cvv"
                      label="CVV"
                      rules={[{ required: true, message: "Please enter CVV" }]}
                    >
                      <Input placeholder="123" size="large" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {paymentMethod === "bank_transfer" && (
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "16px",
                  borderRadius: "8px",
                }}
              >
                <Title level={5}>Bank Transfer Instructions</Title>
                <Paragraph>
                  Please transfer the amount of <strong>${totalPrice}</strong>{" "}
                  to the following account:
                </Paragraph>
                <div style={{ margin: "16px 0" }}>
                  <div>
                    <strong>Bank Name:</strong> Example Bank
                  </div>
                  <div>
                    <strong>Account Name:</strong> Boarding House Booking
                  </div>
                  <div>
                    <strong>Account Number:</strong> 1234567890
                  </div>
                  <div>
                    <strong>Reference:</strong> SUB-
                    {Math.random().toString(36).slice(2, 10).toUpperCase()}
                  </div>
                </div>
                <Alert
                  message="Your subscription will be activated once payment is received"
                  type="warning"
                  showIcon
                />
              </div>
            )}

            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("You must accept the terms and conditions")
                        ),
                },
              ]}
              style={{ marginTop: "16px" }}
            >
              <Checkbox>
                I agree to the <a href="#terms">Terms and Conditions</a> and{" "}
                <a href="#privacy">Privacy Policy</a>
              </Checkbox>
            </Form.Item>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "24px",
              }}
            >
              <Button onClick={handlePrevious}>Back</Button>
              <Button type="primary" onClick={handleNext}>
                Review Order
              </Button>
            </div>
          </Form>
        </div>
      ),
    },
    {
      title: "Review",
      content: (
        <div style={{ padding: "20px 0" }}>
          <ReviewStep />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "24px",
            }}
          >
            <Button onClick={handlePrevious}>Back</Button>
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              Confirm Payment
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: "Complete",
      content: (
        <Result
          status="success"
          title="Payment Successful!"
          subTitle={`Your ${selectedPlan?.name} subscription has been ${
            isRenewing ? "renewed" : "activated"
          }. Valid until ${newDates.endDate}.`}
          extra={[
            <Button
              type="primary"
              key="console"
              onClick={() => setShowPaymentModal(false)}
            >
              Return to Dashboard
            </Button>,
          ]}
        />
      ),
    },
  ];

  return (
    <Modal
      title={
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <Title level={3} style={{ margin: 0 }}>
            {isRenewing ? "Renew" : isUpgrading ? "Upgrade to" : "Subscribe to"}{" "}
            {selectedPlan?.name} Plan
          </Title>
        </div>
      }
      open={showPaymentModal}
      onCancel={() => setShowPaymentModal(false)}
      footer={null}
      width={700}
      bodyStyle={{ padding: "24px" }}
      maskClosable={false}
      destroyOnClose={true}
    >
      <Steps
        current={currentStep}
        size="small"
        style={{ marginBottom: "24px" }}
      >
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div>{steps[currentStep].content}</div>
    </Modal>
  );
};

export default PaymentModal;
