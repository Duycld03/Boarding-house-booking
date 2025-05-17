import { useState } from 'react';
import { DatePicker, Form, Select } from 'antd';
import moment from 'moment';
import { toast } from 'react-toastify';
import ButtonCustom from '../../../component/Button';
import convertTimetap from '../../../utils/convertTimetap';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import './Filter.css';

const { Option } = Select;

function FilterReport({ setFilterValue }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState(null);
  const [status, setStatus] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const { t } = useTranslation('reviewReportManagement');
  const { darkMode } = useTheme();
  const [form] = Form.useForm();

  const handleFilterClick = () => setIsOpen(!isOpen);

  const handleSubmit = (values) => {
    const { startDate, endDate } = values;

    if (startDate && endDate && moment(startDate).isAfter(endDate)) {
      toast.error(t('filters.errors.invalidDateRange'));
      return;
    }

    if (startDate && !endDate) {
      toast.error(t('filters.errors.endDateRequired'));
      return;
    }

    if (endDate && !startDate) {
      toast.error(t('filters.errors.startDateRequired'));
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
      <ButtonCustom
        onClick={handleFilterClick}
        size="large"
        title={t('filters.title')}
        btnFilter
      />

      {isOpen && (
        <div
          className={`absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-2xl ring-1 shadow-lg ring-black/5 focus:outline-hidden ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
          }`}
        >
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className={`py-2 px-4 ${darkMode ? 'dark-form' : ''}`}
          >
            {/* Lý do */}
            <Form.Item
              label={<span>{t('filters.reason')}</span>}
              name="reason"
              className="mb-2"
            >
              <Select
                value={reason}
                onChange={setReason}
                placeholder={t('filters.reasonPlaceholder')}
                allowClear
                className={`w-full ${darkMode ? 'ant-select-dark' : ''}`}
                popupClassName={darkMode ? 'ant-select-dropdown-dark' : ''}
              >
                <Option value="Spam">{t('filters.reasonOptions.spam')}</Option>
                <Option value="Misleading information">
                  {t('filters.reasonOptions.misleading')}
                </Option>
                <Option value="Privacy violation">
                  {t('filters.reasonOptions.privacy')}
                </Option>
                <Option value="Inappropriate content">
                  {t('filters.reasonOptions.inappropriate')}
                </Option>
              </Select>
            </Form.Item>

            {/* Trạng thái */}
            <Form.Item
              label={<span>{t('filters.status')}</span>}
              name="status"
              className="mb-2"
            >
              <Select
                value={status}
                onChange={setStatus}
                placeholder={t('filters.statusPlaceholder')}
                allowClear
                className={`w-full ${darkMode ? 'ant-select-dark' : ''}`}
                popupClassName={darkMode ? 'ant-select-dropdown-dark' : ''}
              >
                <Option value="pending">
                  {t('filters.statusOptions.pending')}
                </Option>
                <Option value="resolved">
                  {t('filters.statusOptions.resolved')}
                </Option>
                <Option value="rejected">
                  {t('filters.statusOptions.rejected')}
                </Option>
              </Select>
            </Form.Item>

            {/* Ngày bắt đầu */}
            <Form.Item
              label={<span>{t('filters.startDate')}</span>}
              name="startDate"
              className="mb-2"
            >
              <DatePicker
                value={startDate ? moment(startDate) : null}
                onChange={(date) => setStartDate(date)}
                format="DD-MM-YYYY"
                allowClear
                inputReadOnly
                className={`w-full ${darkMode ? 'ant-picker-dark' : ''}`}
                placeholder={t('filters.startDatePlaceholder')}
              />
            </Form.Item>

            {/* Ngày kết thúc */}
            <Form.Item
              label={<span>{t('filters.endDate')}</span>}
              name="endDate"
              className="mb-2"
            >
              <DatePicker
                value={endDate ? moment(endDate) : null}
                onChange={(date) => setEndDate(date)}
                format="DD-MM-YYYY"
                allowClear
                inputReadOnly
                className={`w-full ${darkMode ? 'ant-picker-dark' : ''}`}
                placeholder={t('filters.endDatePlaceholder')}
              />
            </Form.Item>

            {/* Nút hành động */}
            <Form.Item className="mt-4">
              <div className="flex justify-between">
                <ButtonCustom
                  btnFilter
                  size="large"
                  htmlType="submit"
                  className="flex-1 w-40"
                  title={t('buttons.submit')}
                />
                <ButtonCustom
                  onClick={handleClear}
                  className="flex-1 w-40"
                  btnDelete
                  size="large"
                  title={t('filters.clear')}
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
