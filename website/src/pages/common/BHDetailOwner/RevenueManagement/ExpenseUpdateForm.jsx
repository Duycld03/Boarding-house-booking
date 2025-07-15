import React, { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Divider,
  Row,
  Col,
  Space,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

// Giá cố định cho điện và nước
const ELECTRICITY_PRICE = 3000; // VND/kWh
const WATER_PRICE = 15000; // VND/m³

const ExpenseUpdateForm = ({
  expenseData,
  onCancel,
  onSubmit,
  isLoading = false,
  isAddNew = false,
  t,
  currentLanguage,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      electricalExpense: expenseData?.electricalExpense || {
        oldNumber: 0,
        newNumber: 0,
        quantityConsumed: 0,
        totalAmount: 0,
      },
      waterExpense: expenseData?.waterExpense || {
        oldNumber: 0,
        newNumber: 0,
        quantityConsumed: 0,
        totalAmount: 0,
      },
      otherExpenses: expenseData?.otherExpenses || [
        { feeName: "", feeAmount: 0 },
      ],
    });
  }, [expenseData, form]);

  // Tính toán số lượng tiêu thụ và tổng tiền
  const calculateQuantity = (fieldType, price) => {
    const values = form.getFieldsValue();
    const expense = values[fieldType];

    if (
      expense &&
      expense.oldNumber !== undefined &&
      expense.newNumber !== undefined
    ) {
      const oldNumber = Number(expense.oldNumber);
      const newNumber = Number(expense.newNumber);

      if (!isNaN(oldNumber) && !isNaN(newNumber) && newNumber >= oldNumber) {
        const quantityConsumed = newNumber - oldNumber;
        const totalAmount = quantityConsumed * price;

        // Cập nhật form
        const updatedExpense = {
          ...expense,
          quantityConsumed,
          totalAmount,
        };

        form.setFieldsValue({
          [fieldType]: updatedExpense,
        });
      }
    }
  };

  const handleFinish = (values) => {
    // Filter out empty other expenses
    const filteredOtherExpenses = values.otherExpenses.filter(
      (expense) => expense.feeName?.trim() && expense.feeAmount !== undefined
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
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Divider>
        {t
          ? t("revenue.expenses.electricity", "Electricity Expense")
          : "Electricity Expense"}
      </Divider>
      <Row gutter={16}>
        {["oldNumber", "newNumber"].map((field, index) => (
          <Col span={12} key={field}>
            <Form.Item
              name={["electricalExpense", field]}
              label={
                index === 0
                  ? t
                    ? t("revenue.expenses.oldReading", "Old Reading")
                    : "Old Reading"
                  : t
                  ? t("revenue.expenses.newReading", "New Reading")
                  : "New Reading"
              }
            >
              <InputNumber
                min={0}
                formatter={(value) =>
                  value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => value?.replace(/\./g, "").replace(",", ".")}
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
              label={
                index === 0
                  ? t
                    ? t("revenue.expenses.consumption", "Consumption")
                    : "Consumption"
                  : t
                  ? t("revenue.expenses.totalAmount", "Total Amount (VND)")
                  : "Total Amount (VND)"
              }
            >
              <InputNumber
                min={0}
                formatter={(value) =>
                  value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => value?.replace(/\./g, "").replace(",", ".")}
                style={{ width: "100%" }}
                disabled={field === "quantityConsumed"}
              />
            </Form.Item>
          </Col>
        ))}
      </Row>

      <Divider />

      <Divider>
        {t ? t("revenue.expenses.water", "Water Expense") : "Water Expense"}
      </Divider>
      <Row gutter={16}>
        {["oldNumber", "newNumber"].map((field, index) => (
          <Col span={12} key={field}>
            <Form.Item
              name={["waterExpense", field]}
              label={
                index === 0
                  ? t
                    ? t("revenue.expenses.oldReading", "Old Reading")
                    : "Old Reading"
                  : t
                  ? t("revenue.expenses.newReading", "New Reading")
                  : "New Reading"
              }
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(value) =>
                  value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => value?.replace(/\./g, "").replace(",", ".")}
                onChange={() => calculateQuantity("waterExpense", WATER_PRICE)}
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
              label={
                index === 0
                  ? t
                    ? t("revenue.expenses.consumption", "Consumption")
                    : "Consumption"
                  : t
                  ? t("revenue.expenses.totalAmount", "Total Amount (VND)")
                  : "Total Amount (VND)"
              }
            >
              <InputNumber
                min={0}
                formatter={(value) =>
                  value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => value?.replace(/\./g, "").replace(",", ".")}
                style={{ width: "100%" }}
                disabled={field === "quantityConsumed"}
              />
            </Form.Item>
          </Col>
        ))}
      </Row>

      <Divider>
        {t ? t("revenue.expenses.other", "Other Expenses") : "Other Expenses"}
      </Divider>

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
                    <Input
                      placeholder={
                        t
                          ? t("revenue.expenses.expenseName", "Expense Name")
                          : "Expense Name"
                      }
                    />
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
                      formatter={(value) =>
                        value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                      }
                      parser={(value) =>
                        value?.replace(/\./g, "").replace(",", ".")
                      }
                      placeholder={
                        t ? t("revenue.expenses.amount", "Amount") : "Amount"
                      }
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
              {t
                ? t("revenue.buttons.addExpense", "Add Expense")
                : "Add Expense"}
            </Button>
          </>
        )}
      </Form.List>

      <Divider />
      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
        <Button onClick={onCancel}>
          {t ? t("revenue.buttons.cancel", "Cancel") : "Cancel"}
        </Button>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          {isAddNew
            ? t
              ? t("revenue.buttons.add", "Add")
              : "Add"
            : t
            ? t("revenue.buttons.save", "Save")
            : "Save"}
        </Button>
      </Space>
    </Form>
  );
};

export default ExpenseUpdateForm;
