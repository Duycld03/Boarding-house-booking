import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { TableCustom as Table, Button, ConfirmModal } from '../../../component';
import { toast } from 'react-toastify';
import { Tooltip } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  getAllBHOwner,
  softDeleteBoardingHouseOwner,
} from '../../../api/BoardingHouseAPI';
import formatAmount from '../../../utils/formatAmount';
import AddBHModal from './AddBH';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/themeContext';
import { useCurrentUser } from '@/context/userContext';
import userRole from '@/constants/userRole';
import i18next from 'i18next';
import getLocalizedAddress from '../../../utils/addressHelper';

function BHManagementOwner() {
  const currentLanguage = i18next.language;
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const { t } = useTranslation('bhManagement');
  const { darkMode } = useTheme();
  const { hasRole } = useCurrentUser();
  const isOwner = hasRole(userRole.owner);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [filterValue, setFilterValue] = useState({});
  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
  });

  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        title: t('columns.name'),
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: t('columns.address'),
        dataIndex: 'address',
        key: 'address',
        width: 200,
        render: (address) =>
          address ? (
            <Tooltip title={getLocalizedAddress(address, currentLanguage)}>
              {getLocalizedAddress(address, currentLanguage)}
            </Tooltip>
          ) : (
            t('messages.noData')
          ),
      },
      {
        title: t('columns.priceRange'),
        dataIndex: 'priceRange',
        key: 'priceRange',
        render: (price) =>
          price ? `${formatAmount(price, currentLanguage)}` : 'N/A',
      },
      {
        title: t('columns.boardingHouseType'),
        dataIndex: 'boardingHouseType',
        key: 'boardingHouseType',
        render: (type) => {
          if (!type) return t('messages.noData');
          return t(`boardingHouseTypes.${type.name}`) || t('messages.noData');
        },
      },
      {
        title: t('columns.totalRooms'),
        dataIndex: 'totalRooms',
        key: 'totalRooms',
        width: 80,
      },
      {
        title: t('columns.availableRooms'),
        dataIndex: 'availableRooms',
        key: 'availableRooms',
        width: 100,
      },
      {
        title: t('columns.action'),
        key: 'action',
        width: 150,
        render: (_, record) => (
          <div className="flex gap-2">
            {isOwner && (
              <Button
                size="large"
                btnDelete
                title={t('columns.delete')}
                onClick={() => {
                  setSelectedData(record);
                  setIsOpenDeleteModal(true);
                }}
              />
            )}

            <Button
              size="large"
              title={t('columns.detail')}
              icon={<FileTextOutlined />}
              onClick={() =>
                navigate(`/bh-management-owner/${record._id}`, {
                  state: { name: record.name },
                })
              }
              className="text-white"
              bgColor="rgb(5 150 105)"
            />
          </div>
        ),
      },
    ],
    [t, navigate]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllBHOwner(filterValue, paginationOptions);
      setBoardingHouses(res.data);
      console.log(res);

      setPagination({
        current: res.pagination.currentPage,
        pageSize: res.pagination.limit,
        total: res.pagination.totalItems,
      });
    } catch (error) {
      console.error('Error fetching boarding houses:', error);
      toast.error(t('messages.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [filterValue, paginationOptions, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    [pagination, handleTableChange, darkMode]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedData?._id) return;
    setLoading(true);
    try {
      await softDeleteBoardingHouseOwner(selectedData._id);
      toast.success(t('messages.deleteSuccess'));
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('messages.deleteFailed'));
    } finally {
      setLoading(false);
      setIsOpenDeleteModal(false);
      setSelectedData(null);
    }
  }, [selectedData, fetchData, t]);

  return (
    <div>
      <div className="flex justify-between mb-4">
        {isOwner && <AddBHModal onAddData={() => fetchData()} />}
        {/* <FilterBH setFilterValue={setFilterValue} /> */}
      </div>

      <Table
        tableName={t('tableName')}
        loading={loading}
        columns={columns}
        data={boardingHouses}
        onChange={handleTableChange}
        pagination={tablePaginationConfig}
        noDataText={t('messages.noData')}
        onRowClick={(data) => {
          console.log("data", data);
        }}
      />

      <ConfirmModal
        title={t('messages.confirmDeleteTitle')}
        content={t('messages.confirmDeleteContent')}
        isOpen={isOpenDeleteModal}
        onOk={handleDelete}
        onCancel={() => {
          setIsOpenDeleteModal(false);
          setSelectedData(null);
        }}
      />
    </div>
  );
}

export default BHManagementOwner;
