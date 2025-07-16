import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { TableCustom as Table, Button, ConfirmModal } from '../../../component';
import { toast } from 'react-toastify';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
    getOwnerTasks,
    getStaffTasks,
    deleteOwnerTask,
} from '../../../api/taskAPI';
import TaskModal from './TaskModal';
import { useCurrentUser } from '@/context/userContext';
import userRole from '@/constants/userRole';
import { getStaffAccounts } from '../../../api/accountAPI';
import { useTranslation } from 'react-i18next';
import { Tooltip } from "antd";
function TaskManagement() {
    const { hasRole } = useCurrentUser();
    const { t } = useTranslation('task');

    const isOwner = hasRole(userRole.owner);
    const isStaff = hasRole(userRole.staff);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);

    const [filterValue, setFilterValue] = useState({});
    const [staffList, setStaffList] = useState([]);

    const columns = useMemo(
        () => [
            {
                title: t('columns.title'),
                dataIndex: 'title',
                key: 'title',
                width: 200,
                render: (title) =>
                    title ? (
                        <Tooltip title={title}>
                            {title.length > 50 ? `${title.slice(0, 50)}...` : title}
                        </Tooltip>
                    ) : (
                        t('messages.noData')
                    ),
            },
            {
                title: t('columns.detail'),
                dataIndex: 'details',
                key: 'details',
                width: 200,
                render: (details) =>
                    details ? (
                        <Tooltip title={details}>
                            {details.length > 50 ? `${details.slice(0, 50)}...` : details}
                        </Tooltip>
                    ) : (
                        t('messages.noData')
                    ),
            },

            {
                title: t('columns.responsibleBy'),
                dataIndex: 'responsibleBy',
                key: 'responsibleBy',
                render: (responsibleBy) =>
                    responsibleBy?.fullname || t('messages.noData'),
            },
            {
                title: t('columns.priority'),
                dataIndex: 'priority',
                key: 'priority',
                render: (priority) => {
                    const key = priority?.toLowerCase();
                    return t(`priorities.${key}`) || priority;
                },
            },
            {
                title: t('columns.status'),
                dataIndex: 'status',
                key: 'status',
                render: (status) => {
                    const key = status?.replace(/\s/g, '').toLowerCase();
                    return t(`statuses.${key}`) || status;
                },
            },
            {
                title: t('columns.dueDate'),
                dataIndex: 'dueDate',
                key: 'dueDate',
                render: (date) => new Date(date).toLocaleDateString(),
            },
            {
                title: t('columns.action'),
                key: 'action',
                render: (_, record) => (
                    <div className="flex gap-2">
                        <Button
                            title={t('actions.edit')}
                            icon={<EditOutlined />}
                            onClick={() => {
                                setSelectedTask(record);
                                setIsOpenModal(true);
                            }}
                            bgColor="rgb(5 150 105)"
                            className="text-white"
                        />

                        {isOwner && (
                            <Button
                                icon={<DeleteOutlined />}
                                btnDelete
                                title={t('actions.delete')}
                                onClick={() => {
                                    setSelectedTask(record);
                                    setIsOpenDeleteModal(true);
                                }}
                            />
                        )}
                    </div>
                ),
            },
        ],
        [t, isOwner]
    );
    useEffect(() => {
        if (isOwner) {
            getStaffAccounts()
                .then((data) => {
                    setStaffList(data || []);
                })
                .catch((err) => {
                    toast.error(t('messages.fetchFailed'));
                });
        }
    }, [isOwner]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = isOwner
                ? await getOwnerTasks(filterValue)
                : await getStaffTasks();
            setTasks(res.data || []);
        } catch (error) {
            toast.error(t('messages.fetchFailed'));
        } finally {
            setLoading(false);
        }
    }, [isOwner, filterValue]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async () => {
        if (!selectedTask?._id) return;
        setLoading(true);
        try {
            await deleteOwnerTask(selectedTask._id);
            toast.success(t('messages.deleteSuccess'));
            fetchData();
        } catch (error) {
            toast.error(t('messages.deleteFailed'));
        } finally {
            setLoading(false);
            setIsOpenDeleteModal(false);
        }
    };

    return (
        <div>
            <TaskModal
                open={isOpenModal}
                onClose={() => {
                    setIsOpenModal(false);
                    setSelectedTask(null);
                }}
                task={selectedTask}
                onSuccess={fetchData}
                staffList={staffList}
            />

            {isOwner && (
                <div className="mb-4">
                    <Button
                        size="large"
                        title={t('actions.add')}
                        onClick={() => setIsOpenModal(true)}
                        bgColor="rgb(59 130 246)"
                        className="text-white"
                    />
                </div>
            )}
            <Table
                tableName={t('table.title')}
                columns={columns}
                data={tasks}
                loading={loading}
                noDataText={t('table.noData')}
            />

            <ConfirmModal
                isOpen={isOpenDeleteModal}
                title={t('modal.deleteTitle')}
                content={t('modal.deleteConfirm')}
                onOk={handleDelete}
                onCancel={() => setIsOpenDeleteModal(false)}
            />
        </div>
    );
}

export default TaskManagement;