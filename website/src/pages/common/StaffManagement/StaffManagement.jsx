import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Avatar } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { addStaff, getStaff, deleteStaff, updateStaff } from '@/api/staffAPI';
import Table from '@/component/Table';
import { Button, ConfirmModal } from '@/component';
import DefaultAvatar from '@/assets/images/none_avatar.png';

import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/themeContext';
import { toast } from 'react-toastify';
import convertTimetap from '@/utils/convertTimetap';
import AddStaffModal from './AddStaffModal';
import UpdateStaffModal from './UpdateStaffModal'; // 👈 Thêm mới

function StaffManagement() {
  const { t } = useTranslation('staffManagement');
  const { darkMode } = useTheme();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalItems: 0,
    limit: 10,
  });

  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
  });

  // ✅ Fetch staff list
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStaff(paginationOptions);
      if (res?.success) {
        setStaffList(res.data);
        if (res.pagination) {
          setPagination({
            currentPage: res.pagination.currentPage,
            totalItems: res.pagination.totalItems,
            limit: res.pagination.limit,
          });
        }
      } else {
        toast.error(res.message || 'Failed to load staff');
      }
    } catch (err) {
      toast.error('Server error while fetching staff');
    } finally {
      setLoading(false);
    }
  }, [paginationOptions]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // ✅ Add
  const handleAddNewData = async (data) => {
    try {
      setLoading(true);
      const res = await addStaff(data);
      if (res?.success) {
        toast.success(t('messages.addSuccess'));
        fetchStaff();
      } else {
        toast.error(res.message || t('messages.addFailed'));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update
  const handleUpdate = async (data) => {
    if (!data || !data._id) return;
    try {
      setLoading(true);
      const res = await updateStaff(data._id, {
        email: data.email,
        fullname: data.fullname,
        gender: data.gender,
      });

      if (res?.success) {
        toast.success(t('messages.updateSuccess'));
        fetchStaff();
      } else {
        toast.error(res.message || t('messages.updateFailed'));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi server');
    } finally {
      setEditTarget(null);
      setLoading(false);
    }
  };

  // ✅ Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setLoading(true);
      const res = await deleteStaff(deleteTarget._id);
      if (res?.success) {
        toast.success(t('messages.deleteSuccess'));
        fetchStaff();
      } else {
        toast.error(res.message || t('messages.deleteFailed'));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setDeleteTarget(null);
      setLoading(false);
    }
  };

  // ✅ Table
  const handleTableChange = (pagination) => {
    setPaginationOptions({
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };

  const tablePaginationConfig = useMemo(
    () => ({
      current: pagination.currentPage,
      pageSize: pagination.limit,
      total: pagination.totalItems,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
    }),
    [pagination]
  );

  const columns = useMemo(
    () => [
      {
        title: t('columns.avatar'),
        dataIndex: 'avatarImage',
        key: 'avatarImage',
        render: (avatarImage) => (
          <Avatar
            src={avatarImage?.url ?? DefaultAvatar}
            shape="circle"
            size="large"
          />
        ),
      },
      {
        title: t('columns.username'),
        dataIndex: 'username',
        key: 'username',
      },
      {
        title: t('columns.fullName'),
        dataIndex: 'fullname',
        key: 'fullname',
      },
      {
        title: t('columns.email'),
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: t('columns.gender'),
        dataIndex: 'gender',
        key: 'gender',
        render: (gender) => {
          switch (gender) {
            case 'male':
              return t('genders.male');
            case 'female':
              return t('genders.female');
            case 'other':
              return t('genders.other');
            default:
              return '-';
          }
        },
      },
      {
        title: t('columns.createdAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (createdAt) => convertTimetap(createdAt),
      },
      {
        title: t('columns.action'),
        key: 'action',
        render: (record) => (
          <div className="flex gap-3">
            <Button
              btnDelete
              title={t('buttons.delete')}
              onClick={() => setDeleteTarget(record)}
            />
            <Button
              btnUpdate
              icon={<FileTextOutlined />}
              title={t('buttons.update')}
              onClick={() => setEditTarget(record)}
            />
          </div>
        ),
      },
    ],
    [t]
  );

  return (
    <div
      className={`txt ${
        darkMode ? 'bg-gray-700 text-text-dark' : 'text-text-light'
      }`}
    >
      <div className="flex justify-between mb-4">
        <AddStaffModal onAddData={handleAddNewData} />
      </div>

      <Table
        tableName={t('tableName')}
        columns={columns}
        data={staffList}
        loading={loading}
        noDataText={t('messages.noData')}
        onChange={handleTableChange}
        pagination={tablePaginationConfig}
      />

      <UpdateStaffModal
        open={!!editTarget}
        initialData={editTarget}
        onCancel={() => setEditTarget(null)}
        onSubmit={handleUpdate}
      />

      <ConfirmModal
        title={t('modals.confirmDelete.title')}
        content={t('modals.confirmDelete.content')}
        onOk={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isOpen={!!deleteTarget}
      />
    </div>
  );
}

export default StaffManagement;
