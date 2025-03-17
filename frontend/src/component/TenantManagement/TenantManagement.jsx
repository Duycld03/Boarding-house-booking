import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Table from '@/component/Table';
import { Button, ConfirmModal } from '@/component';
import {
  getTenantsByBoardingHouse,
  deleteTenantsByBoardingHouse,
} from '../../api/tenantManagement';
import { toast } from 'react-toastify';
import convertTimetap from '@/utils/convertTimetap';

const TenantManagement = () => {
  const { boardingHouseId } = useParams();
  const [tenantData, setTenantData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    const fetchTenantData = async () => {
      setLoading(true);
      try {
        const data = await getTenantsByBoardingHouse(boardingHouseId);
        setTenantData(data);
      } catch (error) {
        toast.error('Failed to fetch tenant data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [boardingHouseId]);

  const handleDelete = async () => {
    if (!selectedTenant) return;
    setLoading(true);
    try {
      await deleteTenantsByBoardingHouse(selectedTenant._id);
      setTenantData(tenantData.filter((t) => t._id !== selectedTenant._id));
      toast.success('Tenant deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete tenant.');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const columns = [
    {
      title: 'Tenant Name',
      dataIndex: 'tenantName',
      key: 'tenantName',
    },
    {
      title: 'Room Number',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
    },
    {
      title: 'Total Deposit Time',
      dataIndex: 'totalDepositTime',
      key: 'totalDepositTime',
    },
    {
      title: 'Start Deposit Date',
      dataIndex: 'startDepositDate',
      key: 'startDepositDate',
      render: (date) => convertTimetap(date),
    },
    {
      title: 'End Deposit Date',
      dataIndex: 'endDepositDate',
      key: 'endDepositDate',
      render: (date) => convertTimetap(date),
    },
    {
      title: 'Action',
      key: 'action',
      render: (record) => (
        <Button
          size="large"
          btnDelete
          title="Delete"
          onClick={() => {
            setSelectedTenant(record);
            setIsOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Table columns={columns} data={tenantData} loading={loading} />
      <ConfirmModal
        title="Confirm Deletion"
        content="Are you sure you want to delete this tenant?"
        isOpen={isOpen}
        onOk={handleDelete}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  );
};

export default TenantManagement;
