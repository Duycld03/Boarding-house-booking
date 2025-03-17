import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Upload, InputNumber, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@/component';
import { toast } from 'react-toastify';
import { getAllFacilities } from '@/api/roomTypeManagement';
import { updateRoomTypeToBoardingHouse } from '@/api/roomTypeManagement';

const UpdateRoomTypeModal = ({ visible, onClose, roomData }) => {
  const [formData, setFormData] = useState({
    typeName: '',
    facilities: [],
    roomSize: '',
    price: '',
    peopleNumber: '',
    image: null,
  });
  const [facilitiesList, setFacilitiesList] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await getAllFacilities();
        if (response && response.data) {
          setFacilitiesList(response.data);
        } else {
          setFacilitiesList([]);
        }
      } catch (error) {
        console.error('Failed to fetch facilities:', error);
        toast.error('Failed to fetch facilities.');
        setFacilitiesList([]);
      }
    };

    fetchFacilities();
  }, []);

  useEffect(() => {
    setLoading(true);
    if (roomData) {
      setFormData({
        typeName: roomData.typeName || '',
        facilities: roomData.facilities.map((fac) => fac._id) || [],
        roomSize: roomData.roomSize || '',
        price: roomData.price || '',
        peopleNumber: roomData.peopleNumber || '',
        image: roomData.image?.imageUrl || null,
      });
      setImagePreview(roomData.image?.imageUrl || null);
    }
  }, [roomData, visible]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedValues) => {
    setFormData((prev) => ({ ...prev, facilities: selectedValues }));
  };

  const uploadProps = {
    beforeUpload: (file) => {
      setFormData((prev) => ({ ...prev, image: file }));
      const imageURL = URL.createObjectURL(file);
      setImagePreview(imageURL);
      return false;
    },
    accept: 'image/*',
    maxCount: 1,
    showUploadList: false,
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async () => {
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

    const formDataToSend = new FormData();
    formDataToSend.append('typeName', formData.typeName);
    formDataToSend.append('roomSize', formData.roomSize);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('peopleNumber', formData.peopleNumber);
    formDataToSend.append('facilities', JSON.stringify(formData.facilities));
    if (formData.image instanceof File) {
      formDataToSend.append('roomType', formData.image);
    }

    try {
      await updateRoomTypeToBoardingHouse(roomData._id, formDataToSend);
      toast.success('Room Type updated successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to update room type:', error);
      toast.error('Failed to update room type. Please try again.');
    }
  };

  return (
    <Modal
      title="Update Room Type"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form layout="vertical">
        <Form.Item label="Room Type Name" required>
          <Input
            placeholder="Enter room type name"
            name="typeName"
            value={formData.typeName}
            onChange={handleInputChange}
          />
        </Form.Item>

        <Form.Item label="Facilities">
          <Select
            mode="multiple"
            placeholder="Select facilities"
            value={formData.facilities}
            onChange={handleSelectChange}
          >
            {facilitiesList.map((facility) => (
              <Select.Option key={facility._id} value={facility._id}>
                {facility.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Room Size (e.g., 20x30, 30x40)" required>
          <Input
            placeholder="Enter room size"
            name="roomSize"
            value={formData.roomSize}
            onChange={handleInputChange}
          />
        </Form.Item>

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
            parser={(value) => value.replace(/\$\s?|,*/g, '')}
            className="w-full"
          />
        </Form.Item>

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

        <Form.Item label="Room Image">
          {!imagePreview ? (
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
                src={imagePreview}
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

        <div className="flex justify-end mt-4">
          <Button btnCancel title="Cancel" onClick={onClose} className="mr-2" />
          <Button
            className="bg-primary text-white flex items-center"
            // loading={loading}
            title="Update"
            onClick={handleSubmit}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateRoomTypeModal;
