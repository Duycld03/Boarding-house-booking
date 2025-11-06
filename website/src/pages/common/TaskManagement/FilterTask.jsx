import React, { useEffect, useState } from 'react';
import { Select, Button, ConfigProvider, Form } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getStaff } from '../../../api/staffAPI';
import { useCurrentUser } from '@/context/userContext';
import userRole from '@/constants/userRole';
import { useTheme } from '@/context/themeContext';
import ButtonCustom from '@/component/Button';

const FilterTask = ({ setFilterValue, onClose }) => {
    const { t } = useTranslation('task');
    const { hasRole } = useCurrentUser();
    const isOwner = hasRole(userRole.owner);
    const { darkMode } = useTheme();

    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(undefined);
    const [selectedPriority, setSelectedPriority] = useState(undefined);
    const [selectedStatus, setSelectedStatus] = useState(undefined);
    const [open, setOpen] = useState(false);

    const [form] = Form.useForm();

    useEffect(() => {
        if (isOwner) {
            getStaff()
                .then((res) => setStaffList(res.data || []))
                .catch(() => { });
        }
    }, [isOwner]);

    const handleApplyFilter = () => {
        const filters = {};
        if (isOwner && selectedStaff) {
            filters.responsibleBy = selectedStaff;
        }
        if (selectedPriority) filters.priority = selectedPriority;
        if (selectedStatus) filters.status = selectedStatus;
        setFilterValue(filters);
        setOpen(true);
    };

    const handleResetFilters = () => {
        form.resetFields();
        setSelectedStaff(undefined);
        setSelectedPriority(undefined);
        setSelectedStatus(undefined);
        setFilterValue(undefined);
        // setOpen(false);
    };

    const themeConfig = {
        algorithm: darkMode
            ? ConfigProvider.darkAlgorithm
            : ConfigProvider.defaultAlgorithm,
        token: darkMode
            ? {
                colorText: "#ffffff", // Văn bản sáng
                colorTextSecondary: "#e5e7eb", // Văn bản phụ nhạt hơn
                colorBgContainer: "#1f2937", // Nền tối
                colorBorder: "#4b5563", // Viền rõ hơn
                colorPrimary: "#3b82f6", // Màu chính (xanh lam)

                // Thiết lập màu sắc cho Input
                colorBgElevated: "#374151", // Nền cho các thành phần thả xuống
                colorFillSecondary: "#374151", // Nền cho các ô input
                colorTextPlaceholder: "#9CA3AF", // Văn bản placeholder
                colorBorderSecondary: "#4B5563", // Viền phụ
                controlItemBgActive: "#3b82f6", // Nền khi được chọn
                controlItemBgHover: "#4B5563", // Nền khi hover
            }
            : {
                colorText: "#000", // Văn bản tối
                colorTextSecondary: "#4b5563", // Văn bản phụ
                colorBgContainer: "#ffffff", // Nền sáng
                colorBorder: "#d9d9d9", // Viền nhạt
                colorPrimary: "#3b82f6", // Màu chính (xanh lam)

                // Thiết lập màu sắc cho Input
                colorBgElevated: "#f5f5f5", // Nền cho các thành phần thả xuống
                colorFillSecondary: "#f5f5f5", // Nền cho các ô input
                colorTextPlaceholder: "#9CA3AF", // Văn bản placeholder
                colorBorderSecondary: "#d9d9d9", // Viền phụ
                controlItemBgActive: "#e5e7eb", // Nền khi được chọn
                controlItemBgHover: "#f0f0f0", // Nền khi hover
            },
        components: {
            // Cấu hình cho Select
            Select: {
                selectorBg: darkMode ? "#374151" : "#FFFFFF", // Nền của Select
                colorText: darkMode ? "#F9FAFB" : "#000", // Văn bản trong Select
                colorBorder: darkMode ? "#4B5563" : "#d9d9d9", // Viền
                optionSelectedBg: darkMode ? "#2563eb" : "#e5e7eb", // Nền khi được chọn
                optionHoverBg: darkMode ? "#4B5563" : "#FFFFFF", // Nền khi hover
            },
            // Cấu hình cho Input
            Input: {
                colorBgContainer: darkMode ? "#374151" : "#FFFFFF", // Nền Input
                colorText: darkMode ? "#F9FAFB" : "#000", // Văn bản trong Input
                colorBorder: darkMode ? "#4B5563" : "#d9d9d9", // Viền
                colorTextPlaceholder: darkMode ? "#9CA3AF" : "#4B5563", // Placeholder
            },
            // Cấu hình cho Form
            Form: {
                labelColor: darkMode ? "#F9FAFB" : "#000", // Màu nhãn Form
            },
        },
    };
    return (
        <ConfigProvider theme={themeConfig}>
            <div className="relative inline-block text-left">
                <ButtonCustom
                    title={t("actions.filter")}
                    btnFilter
                    size="large"
                    className="ml-auto"
                    onClick={() => setOpen((prev) => !prev)}
                />

                {open && (
                    <div
                        className={`absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-md ring-1 shadow-lg ring-black/5 focus:outline-hidden rounded-2xl ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
                            }`}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            className="py-4 px-6"
                            onFinish={handleApplyFilter}
                        >
                            <div className="flex flex-col gap-[0px]">
                                {isOwner && (
                                    <Form.Item label={t('filters.responsibleBy')} name="responsibleBy">
                                        <Select
                                            allowClear
                                            showSearch
                                            value={selectedStaff}
                                            onChange={setSelectedStaff}
                                            placeholder={t('filters.selectResponsible')}
                                            optionFilterProp="label"
                                            options={staffList.map((staff) => ({
                                                label: staff.fullname,
                                                value: staff._id,
                                            }))}
                                        />
                                    </Form.Item>
                                )}

                                <Form.Item label={t('filters.priority')} name="priority">
                                    <Select
                                        allowClear
                                        value={selectedPriority}
                                        onChange={setSelectedPriority}
                                        placeholder={t('filters.selectPriority')}
                                        options={[
                                            { label: t('priorities.high'), value: 'High' },
                                            { label: t('priorities.medium'), value: 'Medium' },
                                            { label: t('priorities.low'), value: 'Low' },
                                        ]}
                                    />
                                </Form.Item>

                                <Form.Item label={t('filters.status')} name="status">
                                    <Select
                                        allowClear
                                        value={selectedStatus}
                                        onChange={setSelectedStatus}
                                        placeholder={t('filters.selectStatus')}
                                        options={[
                                            { label: t('statuses.inprogress'), value: 'In Progress' },
                                            { label: t('statuses.completed'), value: 'Completed' },
                                            { label: t('statuses.cancelled'), value: 'Cancelled' },
                                        ]}
                                    />
                                </Form.Item>
                            </div>
                            <div className="flex justify-evenly mt-4">
                                <ButtonCustom
                                    btnFilter
                                    size="large"
                                    htmlType="submit"
                                    className="w-40"
                                    title={t("actions.filter")}

                                >
                                </ButtonCustom>
                                <ButtonCustom
                                    btnDelete
                                    size="large"
                                    className="w-40"
                                    onClick={handleResetFilters}
                                    title={t("actions.reset")}>
                                </ButtonCustom>

                            </div>
                        </Form>
                    </div>
                )}
            </div>
        </ConfigProvider>
    );
};

export default FilterTask;
