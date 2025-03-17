import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/component';
import { Form, Input, Select, Upload, InputNumber, Image, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  addRoomTypeToBoardingHouse,
  getAllFacilities,
} from '../../api/roomTypeManagement';

const AddRoomTypeModal = ({ onAddData, boardingHouseId }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    typeName: '',
    facilities: [],
    roomSize: '',
    price: '',
    peopleNumber: '',
    image: null,
  });

  // 🛠 Fetch danh sách tiện ích
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await getAllFacilities();
        if (response && response.data) {
          setFacilities(response.data);
        } else {
          setFacilities([]); // ✅ Đảm bảo không bị lỗi khi API không trả về dữ liệu
        }
      } catch (error) {
        console.error('Failed to fetch facilities:', error);
        toast.error('Failed to fetch facilities.');
        setFacilities([]); // ✅ Đảm bảo không bị lỗi nếu API fail
      }
    };
    fetchFacilities();
  }, []);

  // 🛠 Reset form khi mở modal
  const openModal = () => {
    setIsModalVisible(true);
  };

  // 🛠 Đóng modal
  const closeModal = () => {
    setFormData({
      typeName: '',
      facilities: [], // ✅ Reset facilities khi đóng modal
      roomSize: '',
      price: '',
      peopleNumber: '',
      image: null,
    });

    setIsModalVisible(false);
  };

  // 🛠 Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🛠 Xử lý chọn tiện ích
  const handleSelectChange = (selectedValues) => {
    setFormData((prev) => ({
      ...prev,
      facilities: selectedValues.length > 0 ? selectedValues : [], // ✅ Nếu không chọn gì thì gán mảng rỗng
    }));
  };

  // 🛠 Xử lý chọn ảnh
  const uploadProps = {
    beforeUpload: (file) => {
      setFormData((prev) => ({ ...prev, image: file }));
      return false;
    },
    accept: 'image/*',
    maxCount: 1,
    showUploadList: false,
  };

  // 🛠 Xử lý xóa ảnh
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
  };
  useEffect(() => {
    if (isModalVisible) {
      setFormData({
        typeName: '',
        facilities: [], // ✅ Reset lại facilities khi mở modal
        roomSize: '',
        price: '',
        peopleNumber: '',
        image: null,
      });
    }
  }, [isModalVisible]); // Theo dõi trạng thái modal

  // 🛠 Gửi dữ liệu lên API
  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!formData.typeName.trim()) {
        toast.error('Type Name is required.');
        return;
      }
      if (!/^\d+x\d+$/.test(formData.roomSize)) {
        toast.error('Room size must be in format 20x30 or 30x40.');
        return;
      }
      if (
        !formData.price ||
        formData.price < 500000 ||
        formData.price > 100000000
      ) {
        toast.error('Price must be between 500,000 and 100,000,000 VND.');
        return;
      }
      if (!formData.peopleNumber || formData.peopleNumber < 1) {
        toast.error('People number must be at least 1.');
        return;
      }
      if (!formData.image) {
        toast.error('You must upload an image.');
        return;
      }

      // 🛠 Tạo FormData để gửi dữ liệu
      const payload = new FormData();
      payload.append('typeName', formData.typeName);
      payload.append('roomSize', formData.roomSize);
      payload.append('price', formData.price);
      payload.append('peopleNumber', formData.peopleNumber);
      payload.append('roomType', formData.image);

      // ✅ Fix: Chuyển `facilities` thành JSON string để gửi đi
      payload.append('facilities', JSON.stringify(formData.facilities));

      // 🛠 Gọi API tạo Room Type
      const response = await addRoomTypeToBoardingHouse(
        boardingHouseId,
        payload
      );

      if (response?.message === 'Room Type added successfully') {
        toast.success('Room type added successfully!');
        onAddData();
        setFormData({
          typeName: '',
          facilities: [], // ✅ Reset lại facilities sau khi add thành công
          roomSize: '',
          price: '',
          peopleNumber: '',
          image: null,
        });
        closeModal();
      } else {
        throw new Error(response?.message || 'Failed to add room type.');
      }
    } catch (error) {
      console.error('❌ API Error:', error.response?.data || error.message);

      // ✅ Thử lấy lỗi từ `response.data.message` nếu có
      const errorMessage =
        error.response?.data?.message || 'Failed to submit form.';

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nút mở modal */}
      <Button btnAdd title="Add Room Type" size="large" onClick={openModal} />

      {/* Modal */}
      <Modal
        title="Create Room Type"
        open={isModalVisible}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form
          key={isModalVisible ? 'open' : 'closed'} // ✅ Key thay đổi khi mở/đóng modal
          layout="vertical"
          onSubmitCapture={handleSubmit}
        >
          {/* Type Name */}
          <Form.Item label="Room Type Name" required>
            <Input
              placeholder="Enter room type name"
              name="typeName"
              value={formData.typeName}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Facilities" name="facilities" className="mb-2">
            <Select
              mode="multiple"
              placeholder="Select facilities"
              value={formData.facilities.length > 0 ? formData.facilities : []} // ✅ Reset về [] khi modal đóng
              onChange={handleSelectChange}
            >
              {facilities.map((facility) => (
                <Select.Option key={facility._id} value={facility._id}>
                  {facility.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Room Size */}
          <Form.Item label="Room Size (e.g., 20x30, 30x40)" required>
            <Input
              placeholder="Enter room size"
              name="roomSize"
              value={formData.roomSize}
              onChange={handleInputChange}
            />
          </Form.Item>

          {/* Price */}
          <Form.Item label="Price (VND)" required>
            <InputNumber
              placeholder="Enter price"
              name="price"
              value={formData.price}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, price: value }))
              }
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              className="w-full"
            />
          </Form.Item>

          {/* People Number */}
          <Form.Item label="People Number" required>
            <InputNumber
              placeholder="Enter number of people"
              name="peopleNumber"
              value={formData.peopleNumber}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, peopleNumber: value }))
              }
              className="w-full"
            />
          </Form.Item>

          {/* Image Upload */}
          <Form.Item label="Room Image" required>
            {!formData.image ? (
              <Upload
                {...uploadProps}
                listType="picture-card"
                className="custom-upload"
              >
                <div>
                  <PlusOutlined />
                  <p>Upload</p>
                </div>
              </Upload>
            ) : (
              <div className="relative">
                <Image
                  src={URL.createObjectURL(formData.image)}
                  alt="Room Image"
                  className="w-full rounded"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
                >
                  X
                </button>
              </div>
            )}
          </Form.Item>

          {/* Submit Button */}
          <div className="flex justify-end mt-4">
            <Button
              btnCancel
              title="Cancel"
              onClick={closeModal}
              className="mr-2"
            />
            <Button
              className="bg-primary text-white flex items-center"
              title="Submit"
              loading={loading}
              onClick={handleSubmit}
            />
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AddRoomTypeModal;
