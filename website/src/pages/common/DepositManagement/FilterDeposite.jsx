import { useState, useEffect, useContext, useRef } from "react";
import { Select, Slider, Form } from "antd";
import ButtonCustom from "@/component/Button";
import { useTheme } from "@/context/ThemeContext";
import "./DepositManagement.css";

const { Option } = Select;

function FilterDeposit({
  setFilterValue,
  listRoom,
  boardingHouses = [],
  maxRentalTime = 12,
  loading = false,
  t,
}) {
  const { darkMode } = useTheme();
  // State to manage filter popup visibility and form values
  const [isOpen, setIsOpen] = useState(false);
  const [form] = Form.useForm();
  const [rentalTime, setRentalTime] = useState([1, maxRentalTime]);

  // Ref to control dropdown
  const selectRef = useRef(null);
  const boardingHouseSelectRef = useRef(null);

  // Apply dark mode to dropdown when it opens
  const handleDropdownVisibleChange = (open, selectName) => {
    if (open && darkMode) {
      setTimeout(() => {
        const dropdowns = document.querySelectorAll(".ant-select-dropdown");
        dropdowns.forEach((dropdown) => {
          dropdown.classList.add("dark-mode-dropdown");
        });
      }, 0);
    }
  };

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
      {/* Filter button */}
      <ButtonCustom
        onClick={handleFilterClick}
        size="large"
        title="Filter"
        btnFilter
        disabled={loading}
      />

      {isOpen && (
        <div
          className={`absolute right-0 z-10 mt-2 w-96 rounded-md shadow-lg p-4 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className={darkMode ? "dark-form" : ""}
          >
            <Form.Item className="mb-2" label="Status" name="status">
              <Select
                placeholder="Select status"
                allowClear
                className={darkMode ? "dark-select" : ""}
                ref={selectRef}
                onDropdownVisibleChange={(open) =>
                  handleDropdownVisibleChange(open, "status")
                }
              >
                <Option value="accepted">{t(`status.accepted`)}</Option>
                <Option value="deleted">{t(`status.deleted`)}</Option>
                <Option value="pending">{t(`status.pending`)}</Option>
                <Option value="rejected">{t(`status.rejected`)}</Option>
              </Select>
            </Form.Item>

            {/* Rental Time slider */}
            <Form.Item
              className="mb-2"
              label="Rental Time Range"
              name="rentalTime"
            >
              <div className="flex justify-between mt-1 mb-2 rental-range-labels">
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
                className={darkMode ? "dark-slider" : ""}
              />
            </Form.Item>

            {/* Boarding House select */}
            <Form.Item label="Boarding House" name="boardingHouseId">
              <Select
                placeholder="Select boarding house"
                allowClear
                className={darkMode ? "dark-select" : ""}
                ref={boardingHouseSelectRef}
                onDropdownVisibleChange={(open) =>
                  handleDropdownVisibleChange(open, "boardingHouse")
                }
              >
                {boardingHouses?.map((bh) => (
                  <Option key={bh._id} value={bh._id}>
                    {bh.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Buttons */}
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
