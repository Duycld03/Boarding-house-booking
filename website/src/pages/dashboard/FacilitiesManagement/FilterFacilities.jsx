import { useState } from "react";
import { DatePicker, Form, Input } from "antd";
import moment from "moment";
import ButtonCustom from "@/component/Button";
import { toast } from "react-toastify";

function FilterFacilities({ setFilterValue }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
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
      search: values.search || "",
      startDate: startDate || "",
      endDate: endDate || "",
    });
  };

  const handleClear = () => {
    setSearch("");
    setStartDate(null);
    setEndDate(null);
    setFilterValue({ search: "", startDate: "", endDate: "" });
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
        <div className="absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden rounded-2xl">
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className="py-2 px-4"
          >
            <Form.Item label="Search" name="search" className="mb-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                allowClear
              />
            </Form.Item>
            <Form.Item label="Start Date" name="startDate" className="mb-2">
              <DatePicker
                className="w-full"
                value={startDate ? moment(startDate) : null}
                onChange={setStartDate}
                format="DD-MM-YYYY"
                allowClear
              />
            </Form.Item>
            <Form.Item label="End Date" name="endDate" className="mb-2">
              <DatePicker
                className="w-full"
                value={endDate ? moment(endDate) : null}
                onChange={setEndDate}
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

export default FilterFacilities;
