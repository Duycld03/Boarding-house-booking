import { useState } from 'react';
import { DatePicker, Form, Select } from 'antd';
import { toast } from 'react-toastify';
import ButtonCustom from '../../../component/Button';
import convertTimetap from '../../../utils/convertTimetap'; // Import convertTimetap
const { Option } = Select;

function FilterReport({ setFilterValue }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState(null);
  const [status, setStatus] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleFilterClick = () => {
    setIsOpen(!isOpen);
  };

  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    const { startDate, endDate } = values;

    // Check if startDate is later than endDate
    if (
      startDate &&
      endDate &&
      convertTimetap(startDate) > convertTimetap(endDate)
    ) {
      toast.error('Start date cannot be later than end date.');
      return;
    }

    if (startDate && !endDate) {
      toast.error('Please select an end date.');
      return;
    }

    if (endDate && !startDate) {
      toast.error('Please select a start date.');
      return;
    }

    setFilterValue({
      reason: values.reason || '',
      status: values.status || '',
      startDate: startDate ? convertTimetap(startDate) : '',
      endDate: endDate ? convertTimetap(endDate) : '',
    });
  };

  const handleClear = () => {
    setReason(null);
    setStatus(null);
    setStartDate(null);
    setEndDate(null);
    setFilterValue({
      reason: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    form.resetFields();
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <ButtonCustom
          onClick={handleFilterClick}
          size="large"
          title={'Filter'}
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
            <Form.Item label="Reason" name="reason" className="mb-2">
              <Select
                value={reason}
                placeholder="Select reason"
                onChange={setReason}
                allowClear
              >
                <Option value="Spam">spam</Option>
                <Option value="Misleading information">
                  misleading information
                </Option>
                <Option value="Privacy violation">privacy violation</Option>
                <Option value="Inappropriate content">
                  inappropriate content.
                </Option>
              </Select>
            </Form.Item>
            <Form.Item label="Status" name="status" className="mb-2">
              <Select
                value={status}
                placeholder="Select status"
                onChange={setStatus}
                allowClear
              >
                <Option value="pending">pending</Option>
                <Option value="resolved">resolved</Option>
                <Option value="rejected">rejected</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Start Date" name="startDate" className="mb-2">
              <DatePicker
                className="w-full"
                value={startDate ? convertTimetap(startDate) : null}
                onChange={(date) => setStartDate(date)}
                format="DD-MM-YYYY"
                allowClear
              />
            </Form.Item>
            <Form.Item label="End Date" name="endDate" className="mb-2">
              <DatePicker
                className="w-full"
                value={endDate ? convertTimetap(endDate) : null}
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
                  className={'flex-1 w-40'}
                />
                <ButtonCustom
                  onClick={handleClear}
                  className={'flex-1 w-40'}
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

export default FilterReport;
