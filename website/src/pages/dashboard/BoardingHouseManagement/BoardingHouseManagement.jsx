import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import AddressSelector from "../../../component/AddressSelector";
import { Button, TableCustom as Table, ConfirmModal } from "../../../component";
import {
  FileTextOutlined,
  HeartFilled,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";

import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
} from "../../../api/apiAddress";
import {
  getAllBoardingHDB,
  getBoardingHouseDetails,
  updateBoardingHouseDetails,
  getAllBoardingHouseTypes,
  getBoardingHouseImages,
  filterBH,
  uploadFile,
  softDeleteBoardingHouse,
} from "../../../api/BoardingHouseAPI";
import formatAmount from "../../../utils/formatAmount";
import convertTimetap from "../../../utils/convertTimetap";
import CreateBoardingHouse from "./CreateBoardingHouse";
import FilterBoardingHouse from "./FilterBoardingHouse";
import { Form, Input, Select, Upload, InputNumber, Image } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
function BoardingHouseManagement(onClose) {
  const [boardingHData, setBoardingHData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [boardingHouseTypes, setBoardingHouseTypes] = useState([]);
  const [images, setImages] = useState([]);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    owner: "",
    boardingHouseType: "",
    name: "",
    address: {
      province: "",
      district: "",
      ward: "",
      detail: "",
    },
    description: "",
    primaryImage: null,
    otherImages: [],
    priceRange: "",
    electricityPrice: "",
    waterPrice: "",
    // totalRooms: "",
    // availableRooms: "",
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterValue, setFilterValue] = useState();
  const [geoLocation, setGeoLocation] = useState(null);
  // Handle opening the delete modal
  const handleDeleteModal = (record) => {
    setSelectedRequest(record);
    setIsOpenDeleteModal(true);
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllBoardingHDB();
      // console.log("API Response:", response);
      setBoardingHData(response || []);
    } catch (error) {
      console.error("Failed to fetch boarding houses:", error);
    } finally {
      setLoading(false);
    }
  };

  //upload props
  const uploadOtherImgProps = {
    beforeUpload: (file) => {
      handleFileChange({ target: { files: [file] } }, false);
      return false; // Prevent auto-upload
    },
    multiple: true,
    accept: "image/*",
  };
  const uploadProps = {
    beforeUpload: (file) => {
      handleFileChange({ target: { files: [file] } }, true);
      return false; // Prevent auto-upload
    },
    accept: "image/*",
    maxCount: 1,
    showUploadList: false,
  };

  // Handle file uploads
  const handleFileChange = (e, isPrimary = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      primaryImage: isPrimary ? file : prev.primaryImage,
      otherImages: isPrimary
        ? prev.otherImages
        : [...(prev.otherImages || []), file],
    }));
  };
  // Open the form
  const handleOpenForm = () => {
    setIsFormOpen(true);
    setIsDetailOpen(false);
  };

  // Handle closing the create form
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  // Handle success after creating a new boarding house
  const handleFormSuccess = () => {
    fetchData();
    handleCloseForm();
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);
  const fetchImages = async (id) => {
    try {
      const { data } = await getBoardingHouseImages(id);
      setImages(data);
    } catch (error) {
      console.error("Failed to fetch images:", error);
      toast.error("Failed to fetch images.");
    }
  };

  const fetchFilterData = async () => {
    try {
      const res = await filterBH(filterValue);
      setBoardingHData(res);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to fetch filter data.");
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, [filterValue]);

  // Fetch  Boarding House types
  const fetchBoardingHouseTypes = async () => {
    try {
      const response = await getAllBoardingHouseTypes();
      setBoardingHouseTypes(response.data || []);
    } catch (error) {
      console.error("Failed to fetch boarding house types:", error);
      toast.error("Failed to fetch boarding house types.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const provincesData = await fetchProvinces();
        setProvinces(provincesData);

        // Nếu đã chọn tỉnh, fetch districts
        if (formData?.address?.province) {
          const selectedProvince = provincesData.find(
            (p) => p.name === formData.address.province
          );
          if (selectedProvince) {
            const districtsData = await fetchDistricts(selectedProvince.code);
            setDistricts(districtsData);

            // Nếu đã chọn quận, fetch wards
            if (formData?.address?.district) {
              const selectedDistrict = districtsData.find(
                (d) => d.name === formData.address.district
              );
              if (selectedDistrict) {
                const wardsData = await fetchWards(selectedDistrict.code);
                setWards(wardsData);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [formData?.address?.province, formData?.address?.district]);

  const getLocation = async () => {
    try {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            format: "json",
            q: `${formData.address.ward}, ${formData.address.district}, ${formData.address.province}`,
            polygon_geojson: 1,
          },
        }
      );
      setGeoLocation(res.data[0]);
    } catch (error) {
      console.log("Error getting location:", error);
    }
  };

  useEffect(() => {
    getLocation();
  }, [formData?.address?.ward]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");
    if (keys.length === 2) {
      setFormData((prev) => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectedTypesChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: { _id: value },
    }));
  };
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setFormData(null);
  };

  // Xử lý cập nhật thông tin detailsssssss
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Please enter a boarding house name.");
      return;
    }
    if (!formData.address.province) {
      toast.error("Please select a boarding house province.");
      return;
    }
    if (!formData.address.district) {
      toast.error("Please select a boarding house district.");
      return;
    }
    if (!formData.address.ward) {
      toast.error("Please select a boarding house ward.");
      return;
    }
    if (!formData.address.detail) {
      toast.error("Please enter a boarding house details.");
      return;
    }
    try {
      if (!formData._id) {
        toast.error("Invalid form data. Please try again.");
        return;
      }

      const imagesData = [...images];
      const payloadPrimary = new FormData();

      // Upload primary image
      if (formData.primaryImage) {
        payloadPrimary.append("file", formData.primaryImage);

        try {
          const responsePrimary = await uploadFile(payloadPrimary);
          imagesData.push({
            imageUrl: responsePrimary.filePath,
            isPrimary: true,
          });
        } catch (error) {
          toast.error("Please upload a primary image.");
          return;
        }
      }

      // Validate and upload other images
      for (const image of formData.otherImages) {
        const payload = new FormData();
        payload.append("file", image);

        try {
          const response = await uploadFile(payload);
          imagesData.push({
            imageUrl: response.filePath,
            isPrimary: false,
          });
        } catch (error) {
          toast.error("Failed to upload an image.");
          return;
        }
      }

      const form = {
        ownerUsername: formData.owner,
        boardingHouseType: formData.boardingHouseType,
        name: formData.name,
        address: formData.address,
        description: formData.description,
        images: imagesData,
        priceRange: formData.priceRange,
        electricityPrice: formData.electricityPrice,
        waterPrice: formData.waterPrice,
        location: {
          lat: geoLocation?.lat,
          lon: geoLocation?.lon,
        },
      };

      setLoading(true);

      //API  update boarding house details
      const response = await updateBoardingHouseDetails(formData._id, form);

      if (response.success) {
        toast.success("Boarding house updated successfully.");
        fetchData();
        setIsDetailOpen(false);
      } else {
        toast.error(response.message || "Failed to update boarding house.");
      }
    } catch (error) {
      // Handle any unexpected errors
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // Display the specific error message from the backend
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update boarding house. Please try again later.");
      }
    } finally {
      setGeoLocation(null);
      setLoading(false);
    }
  };
  const handleCancel = () => {
    setFormData({
      owner: "",
      boardingHouseType: "",
      name: "",
      address: {
        province: "",
        district: "",
        ward: "",
        detail: "",
      },
      description: "",
      primaryImage: null,
      otherImages: [],
      priceRange: "",
      electricityPrice: "",
      waterPrice: "",
    });

    setIsDetailOpen(false);
  };

  const handleRemovePrimaryImage = () => {
    setFormData((prev) => ({
      ...prev,
      primaryImage: null,
    }));

    //  remove primary Image
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.isPrimary ? { ...img, isPrimary: false } : img
      )
    );
    toast.success("Primary image removed.");
  };

  const handleRemoveOtherImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      otherImages: prev.otherImages.filter((_, i) => i !== index),
    }));
    toast.success("Temporary image removed.");
  };
  const handleImageDelete = (imageId) => {
    // Remove image
    setImages((prevImages) => prevImages.filter((img) => img._id !== imageId));
    toast.success("Image removed from the list.");
  };

  //hàm soft Delete
  const handleSelectDelete = async () => {
    if (!selectedRequest) {
      toast.error("No boarding house selected for deletion.");
      return;
    }

    try {
      const response = await softDeleteBoardingHouse(selectedRequest._id); // Pass the correct _id
      if (response.success) {
        toast.success("Boarding house deleted successfully.");
        fetchData(); // Refresh the data
        setIsOpenDeleteModal(false); // Close the modal
        setSelectedRequest(null); // Clear the selected request
      } else {
        toast.error(response.message || "Failed to delete boarding house.");
      }
    } catch (error) {
      console.error("Failed to delete boarding house:", error);
      toast.error("Failed to delete boarding house. Please try again later.");
    }
  };
  // mở form details
  const onProcessData = async (record) => {
    try {
      const { data } = await getBoardingHouseDetails(record._id);
      setFormData({
        ...data,
        otherImages: Array.isArray(data.otherImages) ? data.otherImages : [],
      });
      setIsDetailOpen(true); // Open the details form
      fetchImages(record._id); // Load images
    } catch (error) {
      console.error("Failed to fetch boarding house details:", error);
      toast.error("Failed to fetch boarding house details.");
    }
  };
  useEffect(() => {
    fetchData();
    fetchBoardingHouseTypes();
  }, []);

  useEffect(() => {
    console.log("Filter value: ", filterValue);
  }, [filterValue]);

  // Cấu hình cột trong bảng
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (text) =>
        text
          ? `${text.detail}, ${text.ward}, ${text.district}, ${text.province}`
          : "",
    },
    {
      title: "Price Range (VND)",
      dataIndex: "priceRange",
      key: "priceRange",
      render: (text) => `${formatAmount(text)}/month`,
    },
    {
      title: "Boarding House Type",
      dataIndex: "boardingHouseType",
      key: "boardingHouseType",
      render: (text) => (text ? text.name : ""),
    },
    {
      title: "Total Rooms",
      dataIndex: "totalRooms",
      key: "totalRooms",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => convertTimetap(text),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <div className="flex gap-3">
          <Button
            title="Delete"
            size="large"
            btnDelete
            className="btn-delete"
            onClick={() => handleDeleteModal(record)}
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

  return (
    <div className="boarding-house-management">
      <div className="flex justify-between">
        <Button
          btnAdd
          title="Add new"
          size="large"
          onClick={handleOpenForm}
        ></Button>

        <FilterBoardingHouse
          setFilterValue={setFilterValue}
          boardingHouseTypes={boardingHouseTypes}
        />
      </div>
      <Table columns={columns} data={boardingHData} loading={loading} />
      <ConfirmModal
        title="Confirm Deletion"
        content={`Are you sure you want to delete "${
          selectedRequest?.name || "this boarding house"
        }"?`}
        onOk={handleSelectDelete}
        onCancel={() => {
          setIsOpenDeleteModal(false);
          setSelectedRequest(null);
        }}
        isOpen={isOpenDeleteModal}
      />
      {isFormOpen && (
        <CreateBoardingHouse
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
      {isDetailOpen && formData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          // click out close details
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseDetail();
              setGeoLocation(null);
            }
          }}
        >
          <Form
            layout="vertical"
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg"
          >
            <h2 className="text-4xl font-bold mb-8">Boarding House Detail</h2>
            <h2 className="text-3xl font-bold mb-4 ">
              1. Owner and information
            </h2>
            {/* <div className="  gap-4 max-h-[600px] "> */}

            <Form.Item label="Name Owner" className="mb-2">
              <Input
                value={formData.ownerId?.fullname || ""}
                readOnly
                className="bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </Form.Item>

            <Form.Item label="Owner" className="mb-2">
              <Input
                value={formData.ownerId?.username || ""}
                readOnly
                className="bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </Form.Item>

            <Form.Item label="Name Boarding House" className="mb-2">
              <Input
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
              />
            </Form.Item>

            <Form.Item label="Boarding House Type" className="mb-2">
              <Select
                name="boardingHouseType"
                value={formData.boardingHouseType?._id || ""}
                onChange={(value) =>
                  handleSelectedTypesChange({
                    target: {
                      name: "boardingHouseType",
                      value,
                    },
                  })
                }
              >
                {boardingHouseTypes.map((type) => (
                  <Select.Option key={type.value} value={type.value}>
                    {type.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <div className="col-span-2">
              <Form.Item label="Description">
                <Input.TextArea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows={4}
                />
              </Form.Item>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-10 ">Address</h2>
            <AddressSelector
              provinces={provinces}
              districts={districts}
              wards={wards}
              onProvinceChange={handleInputChange}
              onDistrictChange={handleInputChange}
              onInputChange={handleInputChange}
              formData={formData}
              location={geoLocation}
              initialPosition={formData?.location}
              setGeoLocation={setGeoLocation}
            />
            <h2 className="text-3xl font-bold mb-4 mt-10 ">3. Image</h2>
            {/* Primary Image */}
            <Form.Item label="Primary Image" className="mb-4">
              <div className="flex flex-col gap-4">
                {/* Check primary Image exists */}
                {formData.primaryImage ||
                images?.find((img) => img.isPrimary) ? (
                  <div className="relative">
                    <Image
                      src={
                        formData.primaryImage
                          ? URL.createObjectURL(formData.primaryImage)
                          : `http://localhost:3000${
                              images.find((img) => img.isPrimary)?.imageUrl
                            }`
                      }
                      alt="Primary"
                      className="object-cover border rounded"
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "300px",
                      }}
                      preview={{
                        mask: <span className="text-white">Preview</span>,
                      }}
                    />
                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={handleRemovePrimaryImage}
                      className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  // If no primary image exists, show the upload button
                  <Upload
                    {...uploadProps}
                    listType="picture-card"
                    showUploadList={false}
                    className="custom-upload"
                  >
                    <div className="border border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-gray-50 transition">
                      <PlusOutlined className="text-2xl text-gray-400" />
                      <p className="text-gray-500 mt-2 text-sm font-medium">
                        Add Primary Image
                      </p>
                      <p className="text-gray-400 text-xs">
                        Drag-drop or click here to choose a file
                      </p>
                    </div>
                  </Upload>
                )}
              </div>
            </Form.Item>

            <Form.Item label="Other Images" className="mb-4">
              <div className="mt-4 flex flex-wrap gap-4">
                {/* Display Other Images*/}
                {images
                  .filter((img) => !img.isPrimary) // Exclude primary images
                  .map((img) => (
                    <div key={img._id} className="relative">
                      <Image
                        src={`http://localhost:3000${img.imageUrl}`}
                        alt="Other Image"
                        className="object-cover border rounded"
                        width={100}
                        height={100}
                        preview={{
                          mask: <span className="text-white">Preview</span>,
                        }}
                      />
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleImageDelete(img._id)}
                        className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10"
                      >
                        X
                      </button>
                    </div>
                  ))}

                {/* Display Uploaded Other Images */}
                {(formData.otherImages || []).map((file, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Other Image ${index + 1}`}
                      className="object-cover border border-gray-200 rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                      width={100}
                      height={100}
                      preview={{
                        mask: <span className="text-white">Preview</span>,
                      }}
                    />
                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveOtherImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full z-10 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      X
                    </button>
                  </div>
                ))}

                {/* Upload Other Images */}
                <Upload
                  {...uploadOtherImgProps}
                  listType="picture-card"
                  showUploadList={false}
                  className="custom-upload"
                >
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-gray-50 transition">
                    <PlusOutlined className="text-2xl text-gray-400" />
                    <p className="text-gray-500 mt-2 text-sm font-medium">
                      Add Primary Image
                    </p>
                    <p className="text-gray-400 text-xs">
                      Drag-drop or click here to choose a file
                    </p>
                  </div>
                </Upload>
              </div>
            </Form.Item>

            <h2 className="text-3xl font-bold mb-4 mt-10 ">4. Price</h2>
            <div>
              <Form.Item label="Price Rent/month (VND)" className="mb-2">
                <InputNumber
                  name="priceRange"
                  value={formData.priceRange || ""}
                  onChange={(value) =>
                    handleInputChange({ target: { name: "priceRange", value } })
                  }
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  } // Thêm dấu phẩy ngăn cách hàng nghìn
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                  min={0}
                />
              </Form.Item>

              <Form.Item label="Electricity Price/kWh (VND)" className="mb-2">
                <InputNumber
                  name="electricityPrice"
                  value={formData.electricityPrice || ""}
                  onChange={(value) =>
                    handleInputChange({
                      target: { name: "electricityPrice", value },
                    })
                  }
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                  min={0}
                />
              </Form.Item>

              <Form.Item label="Water Price/m³ (VND)" className="mb-2">
                <InputNumber
                  name="waterPrice"
                  value={formData.waterPrice || ""}
                  onChange={(value) =>
                    handleInputChange({ target: { name: "waterPrice", value } })
                  }
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                  min={0}
                />
              </Form.Item>
              <h2 className="text-3xl font-bold mb-4 mt-10 ">5. Room</h2>
              <Form.Item label="Total Rooms" className="mb-2">
                <InputNumber
                  value={formData.totalRooms || "0"}
                  readOnly
                  className="bg-gray-100 text-gray-500 cursor-not-allowed"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item label="Available Rooms" className="mb-2">
                <InputNumber
                  value={formData.availableRooms || "0"}
                  readOnly
                  className="bg-gray-100 text-gray-500 cursor-not-allowed"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <h2 className="text-3xl font-bold mb-4 mt-10 ">
                6. Like and Rating
              </h2>
              <Form.Item>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  {/* like */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <HeartFilled style={{ fontSize: "24px", color: "red" }} />
                    <span style={{ fontSize: "16px", color: "#595959" }}>
                      {formData.likes
                        ? Number(formData.likes).toLocaleString("en-US") // Format big numbers with commas
                        : "0"}
                    </span>
                  </div>

                  {/* Rating */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {Array.from({ length: 5 }, (_, index) => {
                      if (index < Math.floor(formData.rating || 0)) {
                        return (
                          <StarFilled
                            key={index}
                            style={{ fontSize: "24px", color: "#FFD700" }}
                          />
                        );
                      } else if (
                        index === Math.floor(formData.rating || 0) &&
                        (formData.rating || 0) % 1 !== 0
                      ) {
                        return (
                          <StarOutlined
                            key={index}
                            style={{ fontSize: "24px", color: "#FFD700" }}
                          />
                        );
                      } else {
                        return (
                          <StarOutlined
                            key={index}
                            style={{ fontSize: "24px", color: "#FFD700" }}
                          />
                        );
                      }
                    })}
                  </div>
                </div>
              </Form.Item>
            </div>
            {/* </div> */}
            <div className="flex justify-end">
              <Button
                className="bg-orange-600 text-white"
                size="large"
                onClick={handleCancel}
                title="Cancel"
              >
                Cancel
              </Button>
              <Button
                className="bg-primary text-white ml-2"
                size="large"
                onClick={handleSubmit}
                title="Update"
              >
                Update
              </Button>
            </div>
          </Form>
        </div>
      )}
    </div>
  );
}

export default BoardingHouseManagement;
