import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Avatar } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { addStaff, getStaff } from '@/api/staffAPI';
import Table from '@/component/Table';
import { Button, ConfirmModal } from '@/component';
import DefaultAvatar from '@/assets/images/none_avatar.png';

import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/themeContext';
import { toast } from 'react-toastify';
import convertTimetap from '@/utils/convertTimetap';
import AddStaffModal from './AddStaffModal';

function StaffManagement() {
  const { t } = useTranslation('staffManagement');
  const { darkMode } = useTheme();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalItems: 0,
    limit: 10,
  });

  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
  });

  // ✅ Fetch staff from API
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStaff(paginationOptions); // Gửi page + limit
      console.log(res);

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
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Server error while fetching staff');
    } finally {
      setLoading(false);
    }
  }, [paginationOptions]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);
  const handleAddNewData = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const res = await addStaff(data);
        if (res?.success) {
          toast.success(t('messages.addSuccess'));
          fetchStaff(); // Gọi lại để cập nhật danh sách
        } else {
          toast.error(res.message || t('messages.addFailed'));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    },
    [t, fetchStaff]
  );

  const handleTableChange = useCallback((pagination) => {
    setPaginationOptions({
      page: pagination.current,
      limit: pagination.pageSize,
    });
  }, []);

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

  const handleDelete = () => {
    if (!selectedData) return;
    setStaffList((prev) =>
      prev.filter((staff) => staff._id !== selectedData._id)
    );
    setIsOpen(false);
    setSelectedData(null);
  };

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
              onClick={() => {
                setSelectedData(record);
                setIsOpen(true);
              }}
            />
            <Button
              btnUpdate
              icon={<FileTextOutlined />}
              title={t('buttons.update')}
              onClick={() => {
                // Mở form cập nhật nếu cần
              }}
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

      <ConfirmModal
        title={t('modals.confirmDelete.title')}
        content={t('modals.confirmDelete.content')}
        onOk={handleDelete}
        onCancel={() => setIsOpen(false)}
        isOpen={isOpen}
      />
    </div>
  );
}

export default StaffManagement;
