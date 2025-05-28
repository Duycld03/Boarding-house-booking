import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { TableCustom as Table, Button, ConfirmModal } from '../../../component';
import { toast } from 'react-toastify';
import { Tooltip } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  getAllBHOwner,
  softDeleteBoardingHouseOwner,
} from '../../../api/BoardingHManagement';
import formatAmount from '../../../utils/formatAmount';
import AddBHModal from './AddBH';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/themeContext';

function BHManagementOwner() {
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const { t } = useTranslation('bhManagement');
  const { darkMode } = useTheme();

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

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      render: (address) =>
        address ? (
          <Tooltip
            title={`${address.detail}, ${address.ward}, ${address.district}, ${address.province}`}
          >
            {`${address.detail}, ${address.ward}, ${address.district}`}
          </Tooltip>
        ) : (
          'N/A'
        ),
    },
    {
      title: 'Price Range (VND)',
      dataIndex: 'priceRange',
      key: 'priceRange',
      render: (price) => (price ? formatAmount(price) : 'N/A'),
    },
    {
      title: 'Boarding House Type',
      dataIndex: 'boardingHouseType',
      key: 'boardingHouseType',
      render: (type) => type?.name || 'N/A',
    },
    {
      title: 'Total Rooms',
      dataIndex: 'totalRooms',
      key: 'totalRooms',
      width: 80,
    },
    {
      title: 'Available Rooms',
      dataIndex: 'availableRooms',
      key: 'availableRooms',
      width: 100,
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            size="large"
            btnDelete
            title="Delete"
            onClick={() => {
              setSelectedData(record);
              setIsOpenDeleteModal(true);
            }}
          />
          <Button
            size="large"
            title="Detail"
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
  ];

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
      toast.error('Failed to fetch boarding houses.');
    } finally {
      setLoading(false);
    }
  }, [filterValue, paginationOptions]);

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
    [pagination]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedData?._id) return;
    setLoading(true);
    try {
      await softDeleteBoardingHouseOwner(selectedData._id);
      toast.success('Boarding house deleted successfully.');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete boarding house.');
    } finally {
      setLoading(false);
      setIsOpenDeleteModal(false);
      setSelectedData(null);
    }
  }, [selectedData, fetchData, t]);

  return (
    <div>
      {/* Top actions: Add + Filter */}
      <div className="flex justify-between mb-4">
        <AddBHModal onAddData={() => fetchData()} />
        {/* <FilterBH setFilterValue={setFilterValue} /> */}
      </div>

      {/* Table display */}
      <Table
        tableName={t('tableName')}
        loading={loading}
        columns={columns}
        data={boardingHouses}
        onChange={handleTableChange}
        pagination={tablePaginationConfig}
        noDataText={t('messages.noData')}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        title="Confirm Deletion"
        content="Are you sure you want to delete this boarding house?"
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
