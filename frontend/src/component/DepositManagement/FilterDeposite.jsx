import { useState, useEffect } from "react";
import { Select, Slider, DatePicker, Form } from "antd";
import ButtonCustom from "@/component/Button";
import { useParams } from "react-router-dom";
import { getMaxDeposit } from "@/api/depositManagement";

const { Option } = Select;

function FilterDeposit({ setFilterValue, listRoom }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form] = Form.useForm();
  const [maxAmount, setMaxAmount] = useState(1000000); // Giá trị mặc định

  const { boardingHouseId } = useParams();

  useEffect(() => {
    getMaxDeposit(boardingHouseId).then((max) => {
      setMaxAmount(max || 1000000);
    });
  }, []);

  const handleFilterClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (values) => {
    setFilterValue({
      status: values.status || "",
      amount: values.amount || null,
      rentalTime: values.rentalTime || null,
      endDate: values.endDate || null,
      roomId: values.roomId || "",
    });
  };

  const handleClear = () => {
    setFilterValue({
      status: "",
      amount: null,
      rentalTime: null,
      endDate: null,
      roomId: "",
    });
    form.resetFields();
  };

  return (
    <div className="relative inline-block text-left">
      <ButtonCustom
        onClick={handleFilterClick}
        size="large"
        title="Filter"
        btnFilter
      />
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-96 rounded-md bg-white ring-1 shadow-lg ring-black/5 p-4">
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item label="Status" name="status">
              <Select placeholder="Select status" allowClear>
                <Option value="accepted">Accepted</Option>
                <Option value="deleted">Deleted</Option>
                <Option value="pending">Pending</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Amount" name="amount">
              <Slider
                min={0}
                max={maxAmount}
                tooltip={{ formatter: (value) => `${value} VND` }}
              />
            </Form.Item>
            <Form.Item label="Rental Time" name="rentalTime">
              <Slider
                min={1}
                max={12}
                tooltip={{ formatter: (value) => `${value} months` }}
              />
            </Form.Item>
            <Form.Item label="End Date" name="endDate">
              <DatePicker className="w-full" format="DD-MM-YYYY" allowClear />
            </Form.Item>
            <Form.Item label="Room" name="roomId">
              <Select placeholder="Select room" allowClear>
                {listRoom?.map((room) => (
                  <Option key={room._id} value={room._id}>
                    {room.roomNumber}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <div className="flex justify-between">
                <ButtonCustom
                  btnFilter
                  size="large"
                  htmlType="submit"
                  className="flex-1 w-40"
                />
                <ButtonCustom
                  onClick={handleClear}
                  className="flex-1 w-40"
                  btnDelete
                  size="large"
                />
              </div>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  );
}

export default FilterDeposit;
