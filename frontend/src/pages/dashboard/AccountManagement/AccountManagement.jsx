import Table from '../../../component/Table';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { Button, ConfirmModal } from '../../../component';
import {
  getAllAccount,
  deleteAccount,
  filterAccount,
  updateAccount,
  createAccount,
} from '../../../api/AccountManagement';
import convertTimetap from '../../../utils/convertTimetap';
import { Avatar } from 'antd';
import DefaultAvatar from '../../../assets/images/none_avatar.png';
import FilterAccount from './FilterAccount';
import AddAccountModal from './AddAccount';
import UpdateAccountModal from './UpdateAccount/UpdateAccount';
import { FileTextOutlined } from '@ant-design/icons';

function AccountManagement() {
  const [accountData, setAccountData] = useState([]);
  const [selectedData, setSelectedData] = useState(undefined);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllAccount();
      setAccountData(res || []);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      toast.error('Failed to fetch accounts. Please try again later.');
      setAccountData([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAccountData = async () => {
    setLoading(true);
    try {
      const res = await filterAccount(filterValue);
      setAccountData(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Failed to fetch filtered accounts:', error);
      toast.error('Failed to fetch filtered accounts. Please try again later.');
      setAccountData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (filterValue) filterAccountData();
  }, [filterValue]);

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatarImage',
      key: 'avatarImage',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (avatarImage) => (
        <Avatar
          src={avatarImage?.url ?? DefaultAvatar}
          shape="circle"
          size="large"
        />
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Full Name',
      dataIndex: 'fullname',
      key: 'fullname',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (fullname) => (
        <div style={{ whiteSpace: 'normal' }}>{fullname}</div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (email) => <div style={{ whiteSpace: 'normal' }}>{email}</div>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (createdAt) => convertTimetap(createdAt),
    },
    {
      title: 'Action',
      key: 'action',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (_, record) => (
        <div className="flex gap-3">
          <Button
            size="large"
            btnDelete
            title="Delete"
            onClick={() => handleSelectDelete(record)}
          />
          <Button
            onClick={() => onProcessData(record)}
            size="large"
            title="Detail"
            icon={<FileTextOutlined />}
            className="text-white"
            bgColor="rgb(5 150 105)"
          />
        </div>
      ),
    },
  ];

  const handleAddNewData = async (data) => {
    setLoading(true);
    try {
      const res = await createAccount(data);
      if (res) {
        fetchData();
        toast.success('Account added successfully');
      } else {
        toast.error('Add account failed');
      }
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onProcessData = (data) => {
    setSelectedData(data);
  };

  const handleUpdate = async (value) => {
    try {
      const res = await updateAccount(selectedData?._id, value);
      if (res) {
        fetchData();
        toast.success('Account updated successfully');
      } else {
        toast.error('Update failed');
      }
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleToggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectDelete = (record) => {
    setCurrentRecord(record);
    handleToggleModal();
  };

  const handleCancel = () => {
    setCurrentRecord(null);
    handleToggleModal();
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      if (!currentRecord?._id) {
        toast.error('Invalid ID');
        return;
      }
      const response = await deleteAccount(currentRecord._id);
      if (response) {
        fetchData();
        setCurrentRecord(null);
        handleToggleModal();
        toast.success('Account deleted successfully');
      } else {
        toast.error('Failed to delete account');
      }
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="txt">
      <div className="flex justify-between">
        <AddAccountModal onAddData={handleAddNewData} />
        <FilterAccount setFilterValue={setFilterValue} />
      </div>
      <div className="overflow-x-auto bg-white">
        <div className="min-w-max">
          <Table
            columns={columns}
            data={accountData}
            loading={loading}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </div>

      <UpdateAccountModal
        accountData={selectedData}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
      <ConfirmModal
        title="Confirm Deletion"
        content="Do you want to delete this account?"
        onOk={handleDelete}
        onCancel={handleCancel}
        isOpen={isOpen}
      />
    </div>
  );
}

export default AccountManagement;
