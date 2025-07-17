import React, { useEffect } from 'react';
import { Form, Input, Modal, Select, DatePicker } from 'antd';
import { useTranslation } from 'react-i18next';
import { useCurrentUser } from '@/context/userContext';
import userRole from '@/constants/userRole';
import dayjs from 'dayjs';
import {
    createOwnerTask,
    updateOwnerTask,
    updateStaffTaskStatus,
} from '../../../api/taskAPI';
import { toast } from 'react-toastify';
import { useTheme } from '../../../context/themeContext';
import classNames from 'classnames';
import { Button } from '../../../component';

const { Option } = Select;

function TaskModal({ open, onClose, onSuccess, task, staffList = [] }) {
    const { darkMode } = useTheme();

    const { t } = useTranslation('task');
    const [form] = Form.useForm();
    const { hasRole } = useCurrentUser();

    const isOwner = hasRole(userRole.owner);
    const isStaff = hasRole(userRole.staff);
    const cx = classNames;

    useEffect(() => {
        if (task) {
            form.setFieldsValue({
                ...task,
                responsibleBy: task.responsibleBy?._id || task.responsibleBy,
                dueDate: task.dueDate ? dayjs(task.dueDate) : null,
            });
        } else {
            form.resetFields();
        }
    }, [task, form]);


    const handleSubmit = async (values) => {
        try {
            const payload = {
                ...values,
                dueDate: values.dueDate.toISOString(),
            };

            if (task) {
                if (isOwner) {
                    await updateOwnerTask(task._id, payload);
                    toast.success(t('messages.updateSuccess'));
                } else if (isStaff) {
                    await updateStaffTaskStatus(task._id, values.status);
                    toast.success(t('messages.updateSuccess'));
                }
            } else {
                await createOwnerTask(payload);
                toast.success(t('messages.createSuccess'));
                form.resetFields();
            }
            onClose();
            onSuccess();
        } catch (error) {
            toast.error(t('messages.submitFailed'));
        }
    };
    const formItemStyle = darkMode
        ? { marginBottom: 4, color: '#F9FAFB' }
        : { marginBottom: 4 };
    return (
        <Modal
            open={open}
            title={task ? t('modal.editTitle') : t('modal.addTitle')}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText={t('actions.save')}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ status: 'In Progress', priority: 'Medium' }}
            >
                <Form.Item
                    label={
                        <span style={{ color: darkMode ? '#ffffff' : '#000000' }}>
                            {t('form.title')}
                        </span>
                    }
                    name="title"
                    rules={[{ required: true, message: t('validation.title') }]}
                    style={formItemStyle}
                >
                    <Input.TextArea
                        disabled={isStaff && task}
                        maxLength={100}
                        rows={2}
                        showCount={{
                            formatter: ({ count, maxLength }) => (
                                <span
                                    style={{
                                        color: darkMode ? '#D1D5DB' : 'rgba(0,0,0,0.45)',
                                    }}
                                >
                                    {t('form.charactersUsed', { count, max: maxLength })}
                                </span>
                            ),
                        }}
                        style={{
                            backgroundColor: darkMode ? '#1e293b' : undefined,
                            color: darkMode ? '#f9fafb' : undefined,
                            borderColor: darkMode ? '#4b5563' : undefined,
                        }}
                    />
                </Form.Item>


                {isOwner && (
                    <Form.Item
                        label={t('form.responsibleBy')}
                        name="responsibleBy"
                        rules={[{ required: true, message: t('validation.responsibleBy') }]}
                        style={formItemStyle}
                    >
                        <Select
                            disabled={isStaff && task}
                            placeholder={t('form.selectStaff')}
                        >
                            {staffList.map((staff) => (
                                <Option key={staff._id} value={staff._id}>
                                    {staff.fullname}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Form.Item label={t('form.details')} name="details" style={formItemStyle}>
                    <Input.TextArea
                        disabled={isStaff && task}
                        maxLength={500}
                        rows={4}
                        showCount={{
                            formatter: ({ count, maxLength }) => (
                                <span
                                    style={{
                                        color: darkMode ? '#D1D5DB' : 'rgba(0,0,0,0.45)',
                                    }}
                                >
                                    {t('form.charactersUsed', { count, max: maxLength })}
                                </span>
                            ),
                        }}
                        className={cx({ 'dark-mode-input': darkMode })}
                        style={
                            darkMode
                                ? {
                                    borderColor: '#4B5563',
                                    color: '#F9FAFB',
                                }
                                : {}
                        }
                    />
                </Form.Item>

                <Form.Item
                    label={t('form.priority')}
                    name="priority"
                    rules={[{ required: true, message: t('validation.priority') }]}
                    style={formItemStyle}
                >
                    <Select disabled={isStaff && task}>
                        <Option value="Low">{t('priorities.low')}</Option>
                        <Option value="Medium">{t('priorities.medium')}</Option>
                        <Option value="High">{t('priorities.high')}</Option>
                    </Select>
                </Form.Item>

                {/* Chỉ render trường status khi cập nhật (update) */}
                {task && (
                    <Form.Item
                        label={t('form.status')}
                        name="status"
                        rules={[{ required: true, message: t('validation.status') }]}
                        style={formItemStyle}
                    >
                        <Select disabled={isStaff && !task}>
                            <Option value="In Progress">{t('statuses.inprogress')}</Option>
                            <Option value="Completed">{t('statuses.completed')}</Option>
                            <Option value="Cancelled">{t('statuses.cancelled')}</Option>
                        </Select>
                    </Form.Item>
                )}

                <Form.Item
                    label={t('form.dueDate')}
                    name="dueDate"
                    rules={[{ required: true, message: t('validation.dueDate') }]}
                    style={formItemStyle}
                >
                    <DatePicker
                        disabled={isStaff && task}
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                </Form.Item>
            </Form>
            <div className="flex justify-end mt-4">
                <Button
                    title={t('buttons.cancel')}
                    btnCancel
                    onClick={onClose}
                    className={cx('bg-red-500 hover:bg-red-600 text-white mr-2', {
                        'dark:bg-red-700': darkMode,
                    })}
                    size="large"
                >
                    {t('buttons.cancel')}
                </Button>
                <Button
                    className={cx('bg-primary text-white flex items-center', {
                        'dark:bg-blue-600': darkMode,
                    })}
                    size="large"
                    onClick={() => form.submit()}
                    title={t('buttons.submit')}
                >
                    {t('buttons.submit')}
                </Button>
            </div>
        </Modal>

    );
}

export default TaskModal;