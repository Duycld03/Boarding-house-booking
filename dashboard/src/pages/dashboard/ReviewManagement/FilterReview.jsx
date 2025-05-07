import { useState } from "react";
import { DatePicker, Form, Input, Select } from "antd";
import { StarOutlined, StarFilled } from "@ant-design/icons";
import moment from "moment";
import ButtonCustom from "../../../component/Button";
import { toast } from "react-toastify";

function FilterReview({ setFilterValue }) {
  const [isOpen, setIsOpen] = useState(false);
  const [boardingHouseName, setBoardingHouseName] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [rating, setRating] = useState([]);

  const [form] = Form.useForm();

  const handleFilterClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (values) => {
    const { startDate, endDate } = values;

    if (startDate && !endDate) {
      toast.error("Please select an end date.");
      return;
    }

    if (endDate && !startDate) {
      toast.error("Please select a start date.");
      return;
    }

    if (startDate && endDate && startDate.isAfter(endDate)) {
      toast.error("Start date cannot be later than end date.");
      return;
    }

    setFilterValue({
      boardingHouse: values.boardingHouse || "",
      startDate: startDate || "",
      endDate: endDate || "",
      ratings: values.rating || [],
    });
  };

  const handleClear = () => {
    setBoardingHouseName("");
    setStartDate(null);
    setEndDate(null);
    setRating([]);
    setFilterValue({
      boardingHouse: "",
      startDate: "",
      endDate: "",
      ratings: [],
    });
    form.resetFields();
  };

  const handleSelectChange = (value) => {
    setRating(value);
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
            <Form.Item
              label="Boarding House Name"
              name="boardingHouse"
              className="mb-2"
            >
              <Input
                value={boardingHouseName}
                placeholder="Enter boarding house name"
                onChange={(e) => setBoardingHouseName(e.target.value)}
                allowClear
              />
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
            <Form.Item label="Rating" name="rating" className="mb-2">
              <Select
                mode="multiple"
                allowClear
                value={rating}
                onChange={handleSelectChange}
                placeholder="Select rating"
                className="w-full"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <Select.Option key={value} value={value}>
                    <div className="flex items-center">
                      {Array.from({ length: value }, (_, i) => (
                        <StarFilled key={i} className="text-yellow-400" />
                      ))}
                      {Array.from({ length: 5 - value }, (_, i) => (
                        <StarOutlined key={i} className="text-gray-300" />
                      ))}
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item className="mt-4">
              <div className="flex justify-between">
                <ButtonCustom
                  btnFilter
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

export default FilterReview;
