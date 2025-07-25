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
import { getStaff } from '../../../api/staffAPI';
import { useTranslation } from 'react-i18next';
import { Tooltip } from "antd";
import FilterTask from './FilterTask';
import ButtonCustom from "../../../component/Button";
import { useTheme } from '@/context/themeContext';

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
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [loadingStaffList, setLoadingStaffList] = useState(false);
    const { darkMode } = useTheme();

    const [filterValue, setFilterValue] = useState();
    const [staffList, setStaffList] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [paginationOptions, setPaginationOptions] = useState({
        page: 1,
        limit: 10,
    });
    useEffect(() => {
    }, [filterValue]);
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
                render: (details) => {
                    if (!details) return null;
                    return (
                        <Tooltip title={details}>
                            {details.length > 50 ? `${details.slice(0, 50)}...` : details}
                        </Tooltip>
                    );
                },
            }
            ,

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
            getStaff()
                .then((res) => {
                    setStaffList(res.data || []);
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
                ? await getOwnerTasks({ ...filterValue, ...paginationOptions })
                : await getStaffTasks({ ...filterValue, ...paginationOptions });

            setTasks(res.data || []);
            setPagination({
                current: res.pagination?.currentPage || 1,
                pageSize: res.pagination?.limit || 10,
                total: res.pagination?.totalItems || 0,
            });
        } catch (error) {
            toast.error(t('messages.fetchFailed'));
        } finally {
            setLoading(false);
        }
    }, [isOwner, filterValue, paginationOptions, t]);



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
    useEffect(() => {
    }, [staffList]);
    const handleTableChange = useCallback(
        (pagination, filters, sorter) => {
            const newPaginationOptions = {
                ...paginationOptions,
                page: pagination.current,
                limit: pagination.pageSize,
            };

            setPaginationOptions(newPaginationOptions);
        },
        [paginationOptions]
    );

    const tablePaginationConfig = useMemo(
        () => ({
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
        }),

        [pagination, handleTableChange]
    );

    useEffect(() => {
        fetchData();
    }, [fetchData, paginationOptions]);
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

            <div className={`flex mb-4 relative ${isOwner ? 'justify-between' : 'justify-end'}`}>
                {isOwner && (
                    <Button
                        size="large"
                        title={t('actions.add')}
                        onClick={() => setIsOpenModal(true)}
                        bgColor="rgb(59 130 246)"
                        className="text-white"
                    />
                )}

                <FilterTask setFilterValue={setFilterValue} />

            </div>
            <div className={darkMode ? 'dark-pagination' : ''}>

                <Table
                    tableName={t('table.title')}
                    columns={columns}
                    data={tasks}
                    loading={loading}
                    noDataText={t('table.noData')}
                    pagination={tablePaginationConfig}
                    onChange={handleTableChange}
                />
            </div>

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