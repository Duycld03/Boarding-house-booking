import { useEffect, useState } from "react";
import { Form, Input, Select, Slider, DatePicker } from "antd";
import ButtonCustom from "../../../component/Button";
import formatAmount from "../../../utils/formatAmount";
import { toast } from "react-toastify";
import {
  getAllWithdrawalRequestStatus,
  getMaxAmountWithdrawRequest,
} from "../../../api/withdrawalrequestmanagement";

const { Option } = Select;

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

function FilterWithdrawal({ setFilterValue }) {
  const [form] = Form.useForm();
  const [status, setStatus] = useState([]);
  const [amountRangeValue, setAmountRangeValue] = useState({
    min: 0,
    max: 100000000000000,
  });

  const [isOpen, setIsOpen] = useState(false);
  const fetchAllWithdrawRequestStatus = async () => {
    try {
      const res = await getAllWithdrawalRequestStatus();
      setStatus(res.map((status) => capitalizeFirstLetter(status)));
    } catch (error) {
      console.error("Error fetching withdraw request status:", error);
    }
  };

  const fetchMaxAmount = async () => {
    try {
      const res = await getMaxAmountWithdrawRequest();
      if (res) {
        const maxAmount = res.amount;
        setAmountRangeValue({
          min: 0,
          max: maxAmount,
        });
      }
    } catch (error) {
      console.log("Có lỗi xảy ra khi lấy giá tối đa!", error);
    }
  };

  useEffect(() => {
    fetchAllWithdrawRequestStatus();
    fetchMaxAmount();
  }, []);

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

    setFilterValue(values);
  };

  const handleClear = () => {
    form.resetFields();
    setFilterValue({
      status: "",
      startDate: "",
      endDate: "",
      amountRange: [0, amountRangeValue.max],
    });
  };

  return (
    <div className="relative inline-block text-left">
      <ButtonCustom
        onClick={() => setIsOpen((prev) => !prev)}
        size="large"
        title="Filter"
        btnFilter
      />
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden rounded-2xl">
          <Form
            form={form}
            initialValues={{
              amountRange: [amountRangeValue.min, amountRangeValue.max],
            }}
            onFinish={handleSubmit}
            layout="vertical"
            className="py-4 px-6"
          >
            <Form.Item label="Amount Range" className="mb-2">
              <Form.Item shouldUpdate className="mb-0">
                {({ getFieldValue }) => {
                  const amountRange = getFieldValue("amountRange") || [
                    amountRangeValue.min,
                    amountRangeValue.max,
                  ];
                  return (
                    <div className="flex justify-between text-2xl mt-1 mb-2">
                      <p className="truncate max-w-[40%]">
                        min: {formatAmount(amountRange[0])}
                      </p>
                      <p className="truncate max-w-[40%] text-right">
                        max: {formatAmount(amountRange[1])}
                      </p>
                    </div>
                  );
                }}
              </Form.Item>

              <Form.Item name="amountRange" className="mb-0">
                <Slider
                  range
                  min={amountRangeValue.min}
                  max={amountRangeValue.max}
                  onChange={(value) => {
                    form.setFieldValue("amountRange", value);
                  }}
                />
              </Form.Item>
            </Form.Item>

            <Form.Item label="Status" name="status" className="mb-2">
              <Select placeholder="Select status" allowClear>
                {status?.map((status, index) => (
                  <Option key={status} value={status} className="capitalize">
                    {status}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Start Date" name="startDate" className="mb-2">
              <DatePicker className="w-full" format="DD-MM-YYYY" allowClear />
            </Form.Item>
            <Form.Item label="End Date" name="endDate" className="mb-2">
              <DatePicker className="w-full" format="DD-MM-YYYY" allowClear />
            </Form.Item>

            <Form.Item>
              <div className="flex justify-evenly mt-4">
                <ButtonCustom
                  btnFilter
                  size="large"
                  htmlType="submit"
                  className="w-40"
                />
                <ButtonCustom
                  onClick={handleClear}
                  btnDelete
                  size="large"
                  className="w-40"
                />
              </div>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  );
}

export default FilterWithdrawal;
