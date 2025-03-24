import React from "react";
import {
  Form,
  Input,
  Button,
  Space,
  Divider,
  Card,
  InputNumber,
  Typography,
  Row,
  Col,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ExpenseUpdateForm = ({
  expenseData,
  onCancel,
  onSubmit,
  isLoading = false,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue({
      id: expenseData?.id,
      electricalExpense: expenseData.electricalExpense || {
        oldNumber: 0,
        newNumber: 0,
        quantityConsumed: 0,
        totalAmount: 0,
      },
      waterExpense: expenseData.waterExpense || {
        oldNumber: 0,
        newNumber: 0,
        quantityConsumed: 0,
        totalAmount: 0,
      },
      otherExpenses: expenseData.otherExpenses?.length
        ? expenseData.otherExpenses
        : [{ feeName: "", feeAmount: 0 }],
    });
  }, [expenseData, form]);

  const ELECTRICITY_PRICE = 3000;
  const WATER_PRICE = 15000;

  const calculateQuantity = (field, price) => {
    const values = form.getFieldsValue();
    const oldNumber = values[field]?.oldNumber || 0;
    const newNumber = values[field]?.newNumber || 0;
    const quantityConsumed = Math.max(0, newNumber - oldNumber);
    const totalAmount = quantityConsumed * price;

    form.setFieldsValue({
      [field]: { ...values[field], quantityConsumed, totalAmount },
    });
  };

  const handleFinish = (values) => {
    const filteredOtherExpenses = values.otherExpenses.filter(
      (expense) => expense.feeName.trim() && expense.feeAmount > 0
    );

    const formattedValues = {
      id: expenseData?.id,
      electricalExpense: {
        ...values.electricalExpense,
        totalAmount: Number(values.electricalExpense.totalAmount),
      },
      waterExpense: {
        ...values.waterExpense,
        totalAmount: Number(values.waterExpense.totalAmount),
      },
      otherExpenses: filteredOtherExpenses,
    };
    onSubmit(formattedValues);
    form.resetFields();
    onCancel();
  };

  return (
    <Card bordered={false}>
      <Title level={4}>Update Expense</Title>
      <Divider />

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Title level={5}>Electricity Expense</Title>
        <Row gutter={16}>
          {["oldNumber", "newNumber"].map((field, index) => (
            <Col span={12} key={field}>
              <Form.Item
                name={["electricalExpense", field]}
                label={index === 0 ? "Old Reading" : "New Reading"}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  onChange={() =>
                    calculateQuantity("electricalExpense", ELECTRICITY_PRICE)
                  }
                />
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Row gutter={16}>
          {["quantityConsumed", "totalAmount"].map((field, index) => (
            <Col span={12} key={field}>
              <Form.Item
                name={["electricalExpense", field]}
                label={index === 0 ? "Consumption" : "Total Amount (VND)"}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  disabled={field === "quantityConsumed"}
                />
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Divider />

        <Title level={5}>Water Expense</Title>
        <Row gutter={16}>
          {["oldNumber", "newNumber"].map((field, index) => (
            <Col span={12} key={field}>
              <Form.Item
                name={["waterExpense", field]}
                label={index === 0 ? "Old Reading" : "New Reading"}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  onChange={() =>
                    calculateQuantity("waterExpense", WATER_PRICE)
                  }
                />
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Row gutter={16}>
          {["quantityConsumed", "totalAmount"].map((field, index) => (
            <Col span={12} key={field}>
              <Form.Item
                name={["waterExpense", field]}
                label={index === 0 ? "Consumption" : "Total Amount (VND)"}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  disabled={field === "quantityConsumed"}
                />
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Divider>Other Expenses</Divider>

        <Form.List name="otherExpenses">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={16} align="middle" className="mb-5">
                  <Col span={14}>
                    <Form.Item
                      {...restField}
                      name={[name, "feeName"]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="Expense Name" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...restField}
                      name={[name, "feeAmount"]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        min={0}
                        placeholder="Amount"
                        style={{ width: "100%" }}
                        addonAfter="VND"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                      style={{
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                  </Col>
                </Row>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Add Expense
              </Button>
            </>
          )}
        </Form.List>

        <Divider />
        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Save
          </Button>
        </Space>
      </Form>
    </Card>
  );
};

export default ExpenseUpdateForm;
