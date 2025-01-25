import { useState } from "react";
import { Input, DatePicker, Form, Select, Button } from "antd";
import moment from "moment";
import ButtonCustom from "../../../component/Button";
import { FilterOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

const { Option } = Select;

function FilterAccount({ setFilterValue }) {
  const [isOpen, setIsOpen] = useState(false);

  // State for each filter field
  const [gender, setGender] = useState(null);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Handle filter button click to toggle dropdown visibility
  const handleFilterClick = () => {
    setIsOpen(!isOpen);
  };

  const [form] = Form.useForm();

  // Handle submitting the filter form
  const handleSubmit = (values) => {
    const { startDate, endDate } = values;

    if (startDate && endDate && moment(startDate).isAfter(endDate)) {
      toast.error("Start date cannot be later than end date.");
      return;
    }

    if (startDate && !endDate) {
      toast.error("Please select an end date.");
      return;
    }

    setFilterValue({
      gender: values.gender || "",
      role: values.role || "",
      status: values.status || "",
      startDate: startDate ? moment(startDate).format("YYYY-MM-DD") : "",
      endDate: endDate ? moment(endDate).format("YYYY-MM-DD") : "",
    });
  };

  // Clear all filter inputs and reset state
  const handleClear = () => {
    setGender("");
    setRole(null);
    setStatus(null);
    setStartDate(null);
    setEndDate(null);
    setFilterValue({
      gender: "",
      role: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    form.resetFields();
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <ButtonCustom
          onClick={handleFilterClick}
          size="large"
          title={"Filter"}
          btnFilter
        ></ButtonCustom>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden rounded-2xl">
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className="py-2 px-4"
          >
            <Form.Item label="Gender" name="gender" className="mb-2">
              <Select
                value={gender}
                placeholder="Select gender"
                onChange={setGender}
                allowClear
              >
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Role" name="role" className="mb-2">
              <Select
                value={role} // Controlled value
                placeholder="Select role"
                onChange={setRole}
                options={[
                  { label: "User", value: "user" },
                  { label: "Admin", value: "admin" },
                  { label: "Owner", value: "owner" },
                ]}
                allowClear
              />
            </Form.Item>

            <Form.Item label="Status" name="status" className="mb-2">
              <Select
                value={status}
                placeholder="Select status"
                onChange={setStatus}
                allowClear
              >
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Start Date" name="startDate" className="mb-2">
              <DatePicker
                className="w-full"
                value={startDate ? moment(startDate) : null}
                onChange={(date) => setStartDate(date)}
                format="DD-MM-YYYY"
                allowClear
              />
            </Form.Item>

            <Form.Item label="End Date" name="endDate" className="mb-2">
              <DatePicker
                className="w-full"
                value={endDate ? moment(endDate) : null}
                onChange={(date) => setEndDate(date)}
                format="DD-MM-YYYY"
                allowClear
              />
            </Form.Item>

            <Form.Item className="mt-4">
              <div className="flex justify-between">
                <ButtonCustom
                  btnFilter
                  ButtonCustom
                  size="large"
                  htmlType="submit"
                  className={"flex-1 w-40"}
                />
                <ButtonCustom
                  onClick={handleClear}
                  className={"flex-1 w-40"}
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

export default FilterAccount;
