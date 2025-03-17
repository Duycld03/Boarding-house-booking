import React from 'react';
import Table from '@/component/Table';
import { Button } from '@/component';

const TenantManagement = () => {
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
    },
    {
      title: 'End Deposit Date',
      dataIndex: 'endDepositDate',
      key: 'endDepositDate',
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Button size="large" btnDelete title="Delete" />,
    },
  ];

  const tenantData = [
    {
      tenantName: 'Nguyễn Văn A',
      roomNumber: 101,
      totalDepositTime: '3 tháng',
      startDepositDate: '10/01/2025',
      endDepositDate: '10/04/2025',
    },
    {
      tenantName: 'Trần Thị B',
      roomNumber: 102,
      totalDepositTime: '6 tháng',
      startDepositDate: '15/02/2025',
      endDepositDate: '15/08/2025',
    },
    {
      tenantName: 'Lê Văn C',
      roomNumber: 103,
      totalDepositTime: '12 tháng',
      startDepositDate: '20/03/2025',
      endDepositDate: '20/03/2026',
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Table columns={columns} data={tenantData} />
    </div>
  );
};

export default TenantManagement;
