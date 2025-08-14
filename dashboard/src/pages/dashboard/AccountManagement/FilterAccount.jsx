import { useState } from "react";
import { DatePicker, Form, Select } from "antd";
import moment from "moment";
import ButtonCustom from "../../../component/Button";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import "./Filter.css";

const { Option } = Select;

function FilterAccount({ setFilterValue }) {
  const [isOpen, setIsOpen] = useState(false);
  // State for each filter field
  const [gender, setGender] = useState(null);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Access translations and dark mode
  const { t } = useTranslation("accountManagement");
  const { darkMode } = useTheme();

  // Handle filter button click to toggle dropdown visibility
  const handleFilterClick = () => {
    setIsOpen(!isOpen);
  };

  const [form] = Form.useForm();

  // Handle submitting the filter form
  const handleSubmit = (values) => {
    const { startDate, endDate } = values;

    if (startDate && !endDate) {
      toast.error(t("filters.errors.endDateRequired"));
      return;
    }

    if (endDate && !startDate) {
      toast.error(t("filters.errors.startDateRequired"));
      return;
    }

    if (startDate && endDate && startDate.isAfter(endDate)) {
      toast.error(t("filters.errors.invalidDateRange"));
      return;
    }

    setFilterValue({
      gender: values.gender || "",
      role: values.role || "",
      status: values.status || "",
      startDate: startDate || "",
      endDate: endDate || "",
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
          title={t("filters.title")}
          btnFilter
        />
      </div>

      {isOpen && (
        <div
          className={`absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-md ring-1 shadow-lg ring-black/5 focus:outline-hidden rounded-2xl ${
            darkMode ? "bg-gray-800 text-white" : "bg-white"
          }`}
        >
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className={`py-2 px-4 ${darkMode ? "dark-form" : ""}`}
          >
            <Form.Item
              label={t("filters.gender")}
              name="gender"
              className="mb-2"
            >
              <Select
                value={gender}
                placeholder={t("forms.gender.placeholder")}
                onChange={setGender}
                allowClear
                className={darkMode ? "dark-mode-select" : ""}
                popupClassName={darkMode ? "dark-mode-select-dropdown" : ""}
              >
                <Option value="male">{t("forms.gender.options.male")}</Option>
                <Option value="female">
                  {t("forms.gender.options.female")}
                </Option>
                <Option value="other">{t("forms.gender.options.other")}</Option>
              </Select>
            </Form.Item>

            <Form.Item label={t("filters.role")} name="role" className="mb-2">
              <Select
                value={role}
                placeholder={t("forms.role.placeholder")}
                onChange={setRole}
                className={darkMode ? "dark-mode-select" : ""}
                popupClassName={darkMode ? "dark-mode-select-dropdown" : ""}
                options={[
                  { label: t("forms.role.options.user"), value: "user" },
                  { label: t("forms.role.options.owner"), value: "owner" },
                  { label: t("forms.role.options.staff"), value: "staff" },
                ]}
                allowClear
              />
            </Form.Item>

            {/* <Form.Item
              label={t("filters.status")}
              name="status"
              className="mb-2"
            >
              <Select
                value={status}
                placeholder={t("filters.statusPlaceholder")}
                onChange={setStatus}
                className={darkMode ? "dark-mode-select" : ""}
                popupClassName={darkMode ? "dark-mode-select-dropdown" : ""}
                allowClear
              >
                <Option value="active">
                  {t("filters.statusOptions.active")}
                </Option>
                <Option value="inactive">
                  {t("filters.statusOptions.inactive")}
                </Option>
              </Select>
            </Form.Item> */}

            <Form.Item
              label={t("filters.startDate")}
              name="startDate"
              className="mb-2"
            >
              <DatePicker
                className={`w-full ${darkMode ? "ant-picker-dark" : ""}`}
                value={startDate ? moment(startDate) : null}
                onChange={(date) => setStartDate(date)}
                placeholder={t("filters.startDatePlaceholder")}
                format="DD-MM-YYYY"
                allowClear
                popupClassName={darkMode ? "dark-mode-picker-dropdown" : ""}
              />
            </Form.Item>

            <Form.Item
              label={t("filters.endDate")}
              name="endDate"
              className="mb-2"
            >
              <DatePicker
                className={`w-full ${darkMode ? "ant-picker-dark" : ""}`}
                value={endDate ? moment(endDate) : null}
                onChange={(date) => setEndDate(date)}
                placeholder={t("filters.endDatePlaceholder")}
                format="DD-MM-YYYY"
                allowClear
                popupClassName={darkMode ? "dark-mode-picker-dropdown" : ""}
              />
            </Form.Item>

            <Form.Item className="mt-4">
              <div className="flex justify-between">
                <ButtonCustom
                  btnFilter
                  size="large"
                  htmlType="submit"
                  className="flex-1 w-40"
                  title={t("buttons.submit")}
                />
                <ButtonCustom
                  onClick={handleClear}
                  className="flex-1 w-40"
                  btnDelete
                  size="large"
                  title={t("filters.clear")}
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
