import React, { useEffect, useState } from 'react';
import { Select, Button, ConfigProvider, Form } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getStaffAccounts } from '../../../api/accountAPI';
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

    const [form] = Form.useForm();

    useEffect(() => {
        if (isOwner) {
            getStaffAccounts()
                .then((res) => setStaffList(res))
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
    };

    const handleResetFilters = () => {
        form.resetFields();
        setSelectedStaff(undefined);
        setSelectedPriority(undefined);
        setSelectedStatus(undefined);
        setFilterValue(undefined);
    };

    const themeConfig = {
        algorithm: darkMode
            ? ConfigProvider.darkAlgorithm
            : ConfigProvider.defaultAlgorithm,
        token: darkMode
            ? {
                colorText: '#ffffff',
                colorTextSecondary: '#e5e7eb',
                colorBgContainer: '#1f2937',
                colorBorder: '#4b5563',
                colorPrimary: '#3b82f6',
                colorBgElevated: '#374151',
                colorFillSecondary: '#374151',
                colorTextPlaceholder: '#9CA3AF',
                colorBorderSecondary: '#4B5563',
                controlItemBgActive: '#3b82f6',
                controlItemBgHover: '#4B5563',
            }
            : {
                colorText: '#000',
                colorTextSecondary: '#4b5563',
                colorBgContainer: '#ffffff',
                colorBorder: '#d9d9d9',
                colorPrimary: '#3b82f6',
                colorBgElevated: '#f5f5f5',
                colorFillSecondary: '#f5f5f5',
                colorTextPlaceholder: '#9CA3AF',
                colorBorderSecondary: '#d9d9d9',
                controlItemBgActive: '#e5e7eb',
                controlItemBgHover: '#f0f0f0',
            },
        components: {
            Select: {
                selectorBg: darkMode ? '#374151' : '#f5f5f5',
                colorText: darkMode ? '#F9FAFB' : '#000',
                colorBorder: darkMode ? '#4B5563' : '#d9d9d9',
                optionSelectedBg: darkMode ? '#2563eb' : '#e5e7eb',
                optionHoverBg: darkMode ? '#4B5563' : '#f0f0f0',
            },
            Form: {
                labelColor: darkMode ? '#F9FAFB' : '#000',
            },
        },
    };

    return (
        <ConfigProvider theme={themeConfig}>
            <div
                className={`absolute right-0 z-10 mt-4 w-96 origin-top-right rounded-md ring-1 shadow-lg ring-black/5 focus:outline-hidden rounded-2xl ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
                    }`}
            >                <Form form={form} layout="vertical" className="py-4 px-6"
            >
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

                    <div className="flex justify-evenly mt-4">
                        <ButtonCustom
                            btnFilter
                            size="large"
                            htmlType="submit"
                            className="w-40"
                            onClick={handleApplyFilter}
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
        </ConfigProvider>
    );
};

export default FilterTask;
