import { useEffect, useState } from 'react';
import { TableCustom as Table, Button, ConfirmModal } from '../../../component';
import { toast } from 'react-toastify';
import { Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FileTextOutlined } from '@ant-design/icons';
import { getAllBHOwner } from '../../../api/BoardingHManagement';
import formatAmount from '../../../utils/formatAmount';
import UpdateBHModal from './UpdateBH';
import AddBHModal from './AddBH';

function BHManagementOwner() {
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const navigate = useNavigate();

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
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
    { title: 'Total Rooms', dataIndex: 'totalRooms', key: 'totalRooms' },
    {
      title: 'Available Rooms',
      dataIndex: 'availableRooms',
      key: 'availableRooms',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className="flex gap-3">
          <Button
            size="large"
            btnDelete
            title={'Delete'}
            // onClick={() => handleSelectDelete(record)}
          />
          <Button
            onClick={() => openEditModal(record)}
            size="large"
            title={'Detail'}
            icon={<FileTextOutlined />}
            className={' text-white'}
            bgColor={'rgb(5 150 105)'}
          />
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllBHOwner();
      if (res) {
        setBoardingHouses(res);
      }
    } catch (error) {
      toast.error(`Can not fetch data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = (record) => {
    setSelectedData(record);
    setIsEditOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between">
        <AddBHModal />
      </div>
      <Table loading={loading} columns={columns} data={boardingHouses ?? []} />

      <ConfirmModal
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        title="Confirm Deletion"
        message="Are you sure you want to delete this boarding house?"
      />

      <UpdateBHModal
        open={isEditOpen} // ⚠️ Đúng prop với Ant Design Modal
        onCancel={() => setIsEditOpen(false)} // ✅ Đóng modal khi hủy
      />
    </div>
  );
}

export default BHManagementOwner;
