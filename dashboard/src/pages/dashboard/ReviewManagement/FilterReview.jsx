import { useState } from 'react';
import { DatePicker, Form, Input, Select } from 'antd';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import moment from 'moment';
import ButtonCustom from '../../../component/Button';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import './Filter.css';

function FilterReview({ setFilterValue }) {
  const [isOpen, setIsOpen] = useState(false);
  const [boardingHouseName, setBoardingHouseName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [rating, setRating] = useState([]);
  const [form] = Form.useForm();

  const { t } = useTranslation('reviewManagement');
  const { darkMode } = useTheme();

  const handleFilterClick = () => setIsOpen(!isOpen);

  const handleSubmit = (values) => {
    const { startDate, endDate } = values;

    if (startDate && !endDate) {
      toast.error(t('filters.errors.endDateRequired'));
      return;
    }
    if (endDate && !startDate) {
      toast.error(t('filters.errors.startDateRequired'));
      return;
    }
    if (startDate && endDate && startDate.isAfter(endDate)) {
      toast.error(t('filters.errors.invalidDateRange'));
      return;
    }

    setFilterValue({
      boardingHouse: values.boardingHouse || '',
      startDate: startDate || '',
      endDate: endDate || '',
      ratings: values.rating || [],
    });
  };

  const handleClear = () => {
    setBoardingHouseName('');
    setStartDate(null);
    setEndDate(null);
    setRating([]);
    setFilterValue({
      boardingHouse: '',
      startDate: '',
      endDate: '',
      ratings: [],
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
          className={`absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-2xl shadow-lg ring-1 ring-black/5 ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
          }`}
        >
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className={`py-2 px-4 ${darkMode ? 'dark-form' : ''}`}
          >
            <Form.Item
              label={t('filters.boardingHouse')}
              name="boardingHouse"
              className="mb-2"
            >
              <Input
                className={darkMode ? 'ant-picker-dark' : ''}
                value={boardingHouseName}
                onChange={(e) => setBoardingHouseName(e.target.value)}
                placeholder={t('filters.boardingHousePlaceholder')}
                allowClear
              />
            </Form.Item>
            <Form.Item
              label={t('filters.startDate')}
              name="startDate"
              className="mb-2"
            >
              <DatePicker
                className={`w-full ${darkMode ? 'ant-picker-dark' : ''}`}
                value={startDate ? moment(startDate) : null}
                onChange={(date) => setStartDate(date)}
                format="DD-MM-YYYY"
                allowClear
                inputReadOnly
                placeholder={t('filters.startDatePlaceholder')}
                popupClassName={darkMode ? 'dark-mode-picker-dropdown' : ''}
              />
            </Form.Item>

            <Form.Item
              label={t('filters.endDate')}
              name="endDate"
              className="mb-2"
            >
              <DatePicker
                className={`w-full ${darkMode ? 'ant-picker-dark' : ''}`}
                value={endDate ? moment(endDate) : null}
                onChange={(date) => setEndDate(date)}
                format="DD-MM-YYYY"
                allowClear
                inputReadOnly
                placeholder={t('filters.endDatePlaceholder')}
                popupClassName={darkMode ? 'dark-mode-picker-dropdown' : ''}
              />
            </Form.Item>

            <Form.Item
              label={t('filters.rating')}
              name="rating"
              className="mb-2"
            >
              <Select
                mode="multiple"
                allowClear
                value={rating}
                onChange={setRating}
                placeholder={t('filters.ratingPlaceholder')}
                className={`w-full ${darkMode ? 'dark-mode-select' : ''}`}
                popupClassName={darkMode ? 'dark-mode-select-dropdown' : ''}
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

export default FilterReview;
