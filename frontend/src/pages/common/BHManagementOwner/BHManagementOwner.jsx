import { useEffect, useState } from 'react';
import { TableCustom as Table, Button, ConfirmModal } from '../../../component';
import { toast } from 'react-toastify';
import { Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FileTextOutlined } from '@ant-design/icons';
import {
  getAllBHOwner,
  softDeleteBoardingHouseOwner,
} from '../../../api/BoardingHManagement';
import formatAmount from '../../../utils/formatAmount';
import UpdateBHModal from './UpdateBH';
import AddBHModal from './AddBH';

function BHManagementOwner() {
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
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
            onClick={() => handleOpenDeleteModal(record)}
          />
          <Button
            onClick={() => openEditModal(record)}
            size="large"
            title={'Detail'}
            icon={<FileTextOutlined />}
            className="text-white"
            bgColor="rgb(5 150 105)"
          />
        </div>
      ),
    },
  ];

  // Fetch the data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllBHOwner();
      console.log('API Response:', res);

      if (res && res.length > 0) {
        setBoardingHouses(res);
      }
    } catch (error) {
      toast.error(`Cannot fetch data: ${error.message}`);
      console.error('Error fetching data:', error);
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

  const handleAddNewData = async () => {
    fetchData();
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (record) => {
    setSelectedData(record); // Save the selected record for deletion
    setIsOpenDeleteModal(true); // Open the confirmation modal
  };

  // Handle the actual delete action
  const handleDelete = async () => {
    if (!selectedData || !selectedData._id) return;

    try {
      setLoading(true); // Show loading indicator
      await softDeleteBoardingHouseOwner(selectedData._id); // Call the API
      toast.success('Boarding house deleted successfully');
      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error deleting boarding house:', error);
      toast.error(error.message || 'Failed to delete boarding house');
    } finally {
      setLoading(false); // Hide loading indicator
      setIsOpenDeleteModal(false); // Close the confirmation modal
      setSelectedData(null); // Clear the selected record
    }
  };

  return (
    <div>
      <div className="flex justify-between">
        <AddBHModal onAddData={handleAddNewData} />
      </div>
      <Table loading={loading} columns={columns} data={boardingHouses ?? []} />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        title="Confirm Deletion"
        content={`Are you sure you want to delete this boarding house`}
        onOk={handleDelete} // Trigger the delete API call
        onCancel={() => {
          setIsOpenDeleteModal(false); // Close modal
          setSelectedData(null); // Clear selected record
        }}
        isOpen={isOpenDeleteModal}
      />

      {/* Edit Modal */}
      <UpdateBHModal open={isEditOpen} onCancel={() => setIsEditOpen(false)} />
    </div>
  );
}

export default BHManagementOwner;
