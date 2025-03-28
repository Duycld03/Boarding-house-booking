import React, { useState } from "react";
import { Modal, Form, Input, Button, Table, Select } from "antd";

const RentCalculationModal = ({ visible, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [additionalFees, setAdditionalFees] = useState([]);
  const [electricalBill, setElectricalBill] = useState({
    oldNumber: 0,
    newNumber: 0,
  });
  const [waterBill, setWaterBill] = useState({ oldNumber: 0, newNumber: 0 });
  const availableRooms = ["101", "102", "103", "104"]; // Danh sách phòng mẫu

  const handleAddFee = () => {
    setAdditionalFees([
      ...additionalFees,
      { key: Date.now(), name: "", amount: 0 },
    ]);
  };

  const handleFeeChange = (key, field, value) => {
    setAdditionalFees(
      additionalFees.map((fee) =>
        fee.key === key ? { ...fee, [field]: value } : fee
      )
    );
  };

  const handleDeleteFee = (key) => {
    setAdditionalFees(additionalFees.filter((fee) => fee.key !== key));
  };

  const calculateAmount = (bill) =>
    Math.max((bill.newNumber - bill.oldNumber) * 3.5, 0);

  const totalAmount =
    calculateAmount(electricalBill) +
    calculateAmount(waterBill) +
    additionalFees.reduce((sum, fee) => sum + Number(fee.amount), 0);

  return (
    <Modal
      title="Calculate Rent"
      open={visible}
      onCancel={onClose}
      onOk={() => onSave(form.getFieldsValue())}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Room Number"
          name="roomNumber"
          rules={[{ required: true }]}
        >
          <Select placeholder="Chọn phòng">
            {availableRooms.map((room) => (
              <Select.Option key={room} value={room}>
                {room}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Electrical Bill">
          <Input.Group compact>
            <Input
              style={{ width: "48%" }}
              placeholder="Old Number"
              type="number"
              onChange={(e) =>
                setElectricalBill({
                  ...electricalBill,
                  oldNumber: Number(e.target.value),
                })
              }
            />
            <Input
              style={{ width: "48%" }}
              placeholder="New Number"
              type="number"
              onChange={(e) =>
                setElectricalBill({
                  ...electricalBill,
                  newNumber: Number(e.target.value),
                })
              }
            />
          </Input.Group>
        </Form.Item>

        <Form.Item label="Water Bill">
          <Input.Group compact>
            <Input
              style={{ width: "48%" }}
              placeholder="Old Number"
              type="number"
              onChange={(e) =>
                setWaterBill({
                  ...waterBill,
                  oldNumber: Number(e.target.value),
                })
              }
            />
            <Input
              style={{ width: "48%" }}
              placeholder="New Number"
              type="number"
              onChange={(e) =>
                setWaterBill({
                  ...waterBill,
                  newNumber: Number(e.target.value),
                })
              }
            />
          </Input.Group>
        </Form.Item>

        <Table dataSource={additionalFees} pagination={false} rowKey="key">
          <Table.Column
            title="Fee Name"
            dataIndex="name"
            render={(text, record) => (
              <Input
                value={text}
                onChange={(e) =>
                  handleFeeChange(record.key, "name", e.target.value)
                }
              />
            )}
          />
          <Table.Column
            title="Amount"
            dataIndex="amount"
            render={(text, record) => (
              <Input
                type="number"
                value={text}
                onChange={(e) =>
                  handleFeeChange(record.key, "amount", e.target.value)
                }
              />
            )}
          />
          <Table.Column
            title="Action"
            render={(text, record) => (
              <Button onClick={() => handleDeleteFee(record.key)}>
                Delete
              </Button>
            )}
          />
        </Table>
        <Button onClick={handleAddFee} style={{ marginTop: 10 }}>
          Add Fee
        </Button>

        <Form.Item label="Total Amount">
          <Input value={totalAmount} readOnly />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RentCalculationModal;
