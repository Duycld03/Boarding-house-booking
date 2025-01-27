import { useState } from "react";
import { DatePicker, Form, Input, Select } from "antd";
import { toast } from "react-toastify";
import ButtonCustom from "../../../component/Button";
import moment from "moment";

function FilterBHReportPopup({ setFilterValue }) {
  const [isOpen, setIsOpen] = useState(false);
  const [boardingHouseName, setBoardingHouseName] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reason, setReason] = useState(null);
  const [status, setStatus] = useState(null);

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
      reason: values.reason || "",
      status: values.status || "",
      startDate: startDate || "",
      endDate: endDate || "",
    });
  };

  const handleClear = () => {
    setBoardingHouseName("");
    setReason(null);
    setStatus(null);
    setStartDate(null);
    setEndDate(null);
    setFilterValue({
      boardingHouse: "",
      reason: "",
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
        />
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
            <Form.Item label="Reason" name="reason" className="mb-2">
              <Select
                placeholder="Select reason"
                allowClear
                value={reason}
                onChange={(value) => setReason(value)}
                className="w-full"
              >
                <Select.Option value="scam on rent or deposit">
                  Scam on Rent or Deposit
                </Select.Option>
                <Select.Option value="false advertisement">
                  False Advertisement
                </Select.Option>
                <Select.Option value="violation of privacy">
                  Violation of Privacy
                </Select.Option>
                <Select.Option value="unfriendly landlord">
                  Unfriendly Landlord
                </Select.Option>
                <Select.Option value="poor security">
                  Poor Security
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Status" name="status" className="mb-2">
              <Select
                placeholder="Select status"
                allowClear
                value={status}
                onChange={(value) => setStatus(value)}
                className="w-full"
              >
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="resolved">Resolved</Select.Option>
                <Select.Option value="rejected">Rejected</Select.Option>
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

export default FilterBHReportPopup;
