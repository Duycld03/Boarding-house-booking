import { useState } from "react";
import { DatePicker, Form, Input, Select, theme } from "antd";
import { toast } from "react-toastify";
import ButtonCustom from "../../../component/Button";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import "./Filter.css"; // Import your CSS file

function FilterBHReportPopup({ setFilterValue }) {
  const [isOpen, setIsOpen] = useState(false);
  const [boardingHouseName, setBoardingHouseName] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reason, setReason] = useState(null);
  const [status, setStatus] = useState(null);
  const { t } = useTranslation("reportBoardingHouse");
  const { darkMode } = useTheme(); // Fixed: properly access the darkMode value

  // Get token from Ant Design theme
  const { token } = theme.useToken();

  const [form] = Form.useForm();

  // Define dropdown styles based on dark mode
  const dropdownStyle = {
    backgroundColor: darkMode ? "#1f2937" : "white",
    color: darkMode ? "#e5e7eb" : token.colorText,
    boxShadow: darkMode
      ? "0 6px 16px 0 rgba(0, 0, 0, 0.48), 0 3px 6px -4px rgba(0, 0, 0, 0.52), 0 9px 28px 8px rgba(0, 0, 0, 0.2)"
      : "0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
    borderRadius: "8px",
  };

  const handleFilterClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (values) => {
    const { startDate, endDate } = values;

    if (startDate && !endDate) {
      toast.error(t("filter.errors.noEndDate"));
      return;
    }

    if (endDate && !startDate) {
      toast.error(t("filter.errors.noStartDate"));
      return;
    }

    if (startDate && endDate && startDate.isAfter(endDate)) {
      toast.error(t("filter.errors.startAfterEnd"));
      return;
    }

    setFilterValue({
      boardingHouse: values.boardingHouse || "",
      reason: values.reason || "",
      status: values.status || "",
      startDate: startDate ? startDate.startOf("day").toISOString() : "",
      endDate: endDate ? endDate.endOf("day").toISOString() : "",
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
          title={t("filter.filterButton")}
          btnFilter
        />
      </div>
      {isOpen && (
        <div
          className={`absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-md ring-1 shadow-lg ring-black/5 focus:outline-hidden rounded-2xl ${
            darkMode ? "dark-mode-dropdown" : ""
          }`}
          style={dropdownStyle}
        >
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className={`py-2 px-4 ${darkMode ? "dark-mode-form" : ""}`}
          >
            <Form.Item
              label={t("filter.boardingHouseName")}
              name="boardingHouse"
              className="mb-2"
            >
              <Input
                value={boardingHouseName}
                placeholder={t("filter.enterBoardingHouseName")}
                onChange={(e) => setBoardingHouseName(e.target.value)}
                allowClear
                className={darkMode ? "dark-mode-input" : ""}
              />
            </Form.Item>
            <Form.Item
              label={t("filter.reason")}
              name="reason"
              className="mb-2"
            >
              <Select
                placeholder={t("filter.selectReason")}
                allowClear
                value={reason}
                onChange={(value) => setReason(value)}
                className={`w-full ${darkMode ? "dark-mode-select" : ""}`}
                dropdownClassName={darkMode ? "dark-mode-select-dropdown" : ""}
              >
                <Select.Option value="scam on rent or deposit">
                  {t("filter.reasonOptions.scamOnRentOrDeposit")}
                </Select.Option>
                <Select.Option value="false advertisement">
                  {t("filter.reasonOptions.falseAdvertisement")}
                </Select.Option>
                <Select.Option value="violation of privacy">
                  {t("filter.reasonOptions.violationOfPrivacy")}
                </Select.Option>
                <Select.Option value="unfriendly landlord">
                  {t("filter.reasonOptions.unfriendlyLandlord")}
                </Select.Option>
                <Select.Option value="poor security">
                  {t("filter.reasonOptions.poorSecurity")}
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={t("filter.status")}
              name="status"
              className="mb-2"
            >
              <Select
                placeholder={t("filter.selectStatus")}
                allowClear
                value={status}
                onChange={(value) => setStatus(value)}
                className={`w-full ${darkMode ? "dark-mode-select" : ""}`}
                dropdownClassName={darkMode ? "dark-mode-select-dropdown" : ""}
              >
                <Select.Option value="pending">
                  {t("status.pending")}
                </Select.Option>
                <Select.Option value="resolved">
                  {t("status.resolved")}
                </Select.Option>
                <Select.Option value="rejected">
                  {t("status.rejected")}
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={t("filter.startDate")}
              name="startDate"
              className="mb-2"
            >
              <DatePicker
                className={`w-full ${darkMode ? "dark-mode-date-picker" : ""}`}
                value={startDate ? moment(startDate) : null}
                onChange={(date) => setStartDate(date)}
                format="DD-MM-YYYY"
                allowClear
                placeholder={t("filter.startDate")}
                dropdownClassName={darkMode ? "dark-mode-picker-dropdown" : ""}
              />
            </Form.Item>
            <Form.Item
              label={t("filter.endDate")}
              name="endDate"
              className="mb-2"
            >
              <DatePicker
                className={`w-full ${darkMode ? "dark-mode-date-picker" : ""}`}
                value={endDate ? moment(endDate) : null}
                onChange={(date) => setEndDate(date)}
                format="DD-MM-YYYY"
                allowClear
                placeholder={t("filter.endDate")}
                dropdownClassName={darkMode ? "dark-mode-picker-dropdown" : ""}
              />
            </Form.Item>
            <Form.Item className="mt-4">
              <div className="flex justify-between">
                <ButtonCustom
                  btnFilter
                  size="large"
                  htmlType="submit"
                  className="flex-1 w-40"
                  title={t("filter.apply")}
                />
                <ButtonCustom
                  onClick={handleClear}
                  className="flex-1 w-40"
                  btnDelete
                  size="large"
                  title={t("filter.clear")}
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
