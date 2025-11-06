import { useState, useEffect } from "react";
import { Select, Slider, Form } from "antd";
import ButtonCustom from "@/component/Button";

const { Option } = Select;

function FilterDeposit({
  setFilterValue,
  listRoom,
  boardingHouses = [], // Thêm prop boardingHouses
  maxRentalTime = 12,
  loading = false,
  t,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [form] = Form.useForm();
  const [rentalTime, setRentalTime] = useState([1, maxRentalTime]);

  // Cập nhật giá trị state khi props thay đổi
  useEffect(() => {
    setRentalTime([1, maxRentalTime]);
    form.setFieldsValue({ rentalTime: [1, maxRentalTime] });
  }, [maxRentalTime]);

  const handleFilterClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (values) => {
    // Chỉ gửi các filter có giá trị hoặc khác với giá trị mặc định
    const filters = {};

    if (values.status && values.status !== "") {
      filters.status = values.status;
    }

    // Chỉ áp dụng rentalTime nếu khác với giá trị mặc định
    if (
      values.rentalTime &&
      (values.rentalTime[0] > 1 || values.rentalTime[1] < maxRentalTime)
    ) {
      filters.rentalTime = values.rentalTime;
    }

    // Thay thế roomId bằng boardingHouseId
    if (values.boardingHouseId && values.boardingHouseId !== "") {
      filters.boardingHouseId = values.boardingHouseId;
    }

    setFilterValue(filters);
    // Giữ popup mở sau khi submit
  };

  const handleClear = () => {
    form.resetFields();
    setRentalTime([1, maxRentalTime]);
    setFilterValue({}); // Gửi filter rỗng để hiển thị tất cả dữ liệu
    // Giữ popup mở sau khi clear
  };

  // Hàm để đóng popup
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <ButtonCustom
        onClick={handleFilterClick}
        size="large"
        title="Filter"
        btnFilter
        disabled={loading}
      />
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-96 rounded-md bg-white ring-1 shadow-lg ring-black/5 p-4">
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item className="mb-2" label="Status" name="status">
              <Select placeholder="Select status" allowClear>
                <Option value="pending">{t(`status.pending`)}</Option>
                <Option value="accepted">{t(`status.accepted`)}</Option>
                <Option value="rejected">{t(`status.rejected`)}</Option>
                <Option value="confirmed">{t(`status.confirmed`)}</Option>
                <Option value="refunded">{t(`status.refunded`)}</Option>
              </Select>
            </Form.Item>

            <Form.Item
              className="mb-2"
              label="Rental Time Range"
              name="rentalTime"
            >
              <div className="flex justify-between text-2xl mt-1 mb-2">
                <p>min: {rentalTime[0]} </p>
                <p>max: {rentalTime[1]}</p>
              </div>
              <Slider
                range
                min={1}
                max={maxRentalTime}
                defaultValue={[1, maxRentalTime]}
                value={rentalTime}
                onChange={(value) => {
                  setRentalTime(value);
                  form.setFieldsValue({ rentalTime: value });
                }}
              />
            </Form.Item>

            {/* Thay thế Room Number bằng Boarding House */}
            <Form.Item label="Boarding House" name="boardingHouseId">
              <Select placeholder="Select boarding house" allowClear>
                {boardingHouses?.map((bh) => (
                  <Option key={bh._id} value={bh._id}>
                    {bh.name}
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
                  title="Apply"
                />
                <ButtonCustom
                  onClick={handleClear}
                  className="flex-1 w-40"
                  btnDelete
                  size="large"
                  title="Reset"
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
