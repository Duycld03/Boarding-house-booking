import { useState, useEffect } from "react";
import { Select, Slider, DatePicker, Form } from "antd";
import ButtonCustom from "@/component/Button";
import { useParams } from "react-router-dom";
import { getMaxDeposit, getRentTime } from "@/api/depositManagement";
import formatAmount from "@/utils/formatAmount";

const { Option } = Select;

function FilterDeposit({ setFilterValue, listRoom }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form] = Form.useForm();
  const [maxAmount, setMaxAmount] = useState(1000000);
  const [currentPrice, setCurrentPrice] = useState({ min: 0, max: 1000000 });
  const [maxRentalTime, setMaxRentalTime] = useState(12);
  const [rentalTime, setRentalTime] = useState([1, 12]);

  const { boardingHouseId } = useParams();

  useEffect(() => {
    getMaxDeposit(boardingHouseId).then((max) => {
      const maxValue = max || 1000000;
      setMaxAmount(maxValue);
      setCurrentPrice({ min: 0, max: maxValue });
    });

    getRentTime(boardingHouseId).then((maxTime) => {
      setMaxRentalTime(maxTime || 12);
      setRentalTime([1, maxTime || 12]);
    });
  }, []);

  const handleFilterClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (values) => {
    setFilterValue({
      status: values.status || "",
      priceRange: values.priceRange || [0, maxAmount],
      rentalTime: values.rentalTime || [1, maxRentalTime],
      endDate: values.endDate ? [values.endDate[0], values.endDate[1]] : null,
      roomId: values.roomId || "",
    });
  };

  const handleClear = () => {
    form.resetFields();
    setFilterValue({
      status: "",
      priceRange: [0, maxAmount],
      rentalTime: [1, maxRentalTime],
      endDate: null,
      roomId: "",
    });
    setCurrentPrice({ min: 0, max: maxAmount });
    setRentalTime([1, maxRentalTime]);
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
            <Form.Item className="mb-2" label="Status" name="status">
              <Select placeholder="Select status" allowClear>
                <Option value="accepted">Accepted</Option>
                <Option value="deleted">Deleted</Option>
                <Option value="pending">Pending</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Price Range" name="priceRange" className="mb-2">
              <div className="flex justify-between text-2xl mt-1 mb-2">
                <p className="truncate max-w-[40%]">
                  min: {formatAmount(currentPrice.min)}
                </p>
                <p className="truncate max-w-[40%] text-right">
                  max: {formatAmount(currentPrice.max)}
                </p>
              </div>
              <Slider
                range
                min={0}
                max={maxAmount}
                defaultValue={[0, maxAmount]}
                onChange={(value) => {
                  setCurrentPrice({ min: value[0], max: value[1] });
                  form.setFieldsValue({ priceRange: value });
                }}
              />
            </Form.Item>

            {/* Rental Time Range (Updated) */}
            <Form.Item
              className="mb-2"
              label="Rental Time Range"
              name="rentalTime"
            >
              <div className="flex justify-between text-2xl mt-1 mb-2">
                <p>min: {rentalTime[0]}</p>
                <p>max: {rentalTime[1]} </p>
              </div>
              <Slider
                range
                min={1}
                max={maxRentalTime}
                defaultValue={[1, maxRentalTime]}
                onChange={(value) => {
                  setRentalTime(value);
                  form.setFieldsValue({ rentalTime: value });
                }}
              />
            </Form.Item>

            <Form.Item className="mb-2" label="End Date Range" name="endDate">
              <DatePicker.RangePicker className="w-full" allowClear />
            </Form.Item>

            <Form.Item label="Room Number" name="roomId">
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
