import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Table, Select } from "antd";
import { getAvailableRooms } from "@/api/ownerUser/roomManagement";
import { toast } from "react-toastify";
import { getElectricalAndWaterPrice } from "@/api/ownerUser/boardingHouse";
import { calculateMonthlyBill } from "@/api/ownerUser/paymentBillManagement";

const CalculateRent = ({
  visible,
  setVisible,
  boardingHouseId,
  fetchRentPaymentData,
}) => {
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

  const onClose = () => {
    setVisible(false);
    setAdditionalFees([]);
    setElectricalBill({ oldNumber: 0, newNumber: 0 });
    setWaterBill({ oldNumber: 0, newNumber: 0 });
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
      toast.error("Please fill in all fields before saving.");
      return;
    }

    if (
      electricalBill.oldNumber < 0 ||
      electricalBill.newNumber < 0 ||
      waterBill.oldNumber < 0 ||
      waterBill.newNumber < 0
    ) {
      toast.error("Numbers must not be negative.");
      return;
    }

    if (
      electricalBill.newNumber < electricalBill.oldNumber ||
      waterBill.newNumber < waterBill.oldNumber
    ) {
      toast.error("New number must be greater than or equal to old number.");
      return;
    }

    if (electricalBill.newNumber < electricalBill.oldNumber) {
      toast.error(
        "New electrical bill number must be greater than old number."
      );
      return;
    }

    if (waterBill.newNumber < waterBill.oldNumber) {
      toast.error("New water bill number must be greater than old number.");
      return;
    }

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
      additionalFees: additionalFees,
    };

    setLoading(true);
    try {
      console.log(payload);
      const res = await calculateMonthlyBill(payload);
      toast.success(res.message);
      fetchRentPaymentData();
    } catch (error) {
      console.error("Error calculating rent:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
      onClose();
    }

    console.log("Data is valid. Proceed with saving...");
  };

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

  const calculateElectricalPrice = () =>
    Math.max(
      (electricalBill.newNumber - electricalBill.oldNumber) *
        electricalBillPrice ?? 0,
      0
    );

  const calculateWaterPrice = () =>
    Math.max(
      (waterBill.newNumber - waterBill.oldNumber) * waterBillPrice ?? 0,
      0
    );

  const CalculateTotalAmount = () => {
    return (
      roomPrice +
      calculateElectricalPrice() +
      calculateWaterPrice() +
      additionalFees.reduce((sum, fee) => sum + Number(fee.amount), 0)
    );
  };

  useEffect(() => {
    const total = CalculateTotalAmount();
    setTotalAmount(total);
  }, [
    roomPrice,
    calculateElectricalPrice,
    calculateWaterPrice,
    additionalFees,
  ]);

  const fetchAvailableRooms = async () => {
    try {
      const res = await getAvailableRooms(boardingHouseId);
      setAvailableRooms(res);
    } catch (error) {
      setAvailableRooms([]);
    } finally {
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

  useEffect(() => {
    const selectedRoom = availableRooms.find((room) => room._id === selectRoom);
    debugger;
    if (selectedRoom) {
      setRoomPrice(selectedRoom?.roomTypeId?.price);
      setElectricalBill({
        oldNumber: selectedRoom.previousElectricityReading,
        newNumber: 0,
      });
      setWaterBill({
        oldNumber: selectedRoom.previousWaterReading,
        newNumber: 0,
      });
    }
  }, [selectRoom]);

  return (
    <Modal
      title="Calculate Rent"
      open={visible}
      onCancel={onClose}
      onOk={onOk}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Room Number"
          name="roomNumber"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select Room"
            onChange={setSelectRoom}
            value={selectRoom}
          >
            {availableRooms.map((room) => (
              <Select.Option key={room._id} value={room._id}>
                {room.roomNumber}
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
              value={electricalBill.oldNumber}
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
              value={electricalBill.newNumber}
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
              value={waterBill.oldNumber}
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
              value={waterBill.newNumber}
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

export default CalculateRent;
