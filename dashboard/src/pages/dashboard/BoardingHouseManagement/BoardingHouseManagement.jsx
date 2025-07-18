import { toast } from "react-toastify";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
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
import { useNavigate } from "react-router-dom";
import BHDetailAdmin from "./BHDetailsAdmin";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/themeContext";
import { Tooltip } from 'antd';
import i18next from 'i18next';
import getLocalizedAddress from '../../../utils/addressHelper';

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
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [pageSize, setPageSize] = useState(10); // Number of items per page
  const [totalItems, setTotalItems] = useState(0); // Total number of items
  const { darkMode } = useTheme();
  const currentLanguage = i18next.language;

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });
  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
    sortField: "createdAt",
    sortOrder: "desc",
  });
  const { t } = useTranslation("boardingHouseAdmin");
  // Handle opening the delete modal
  const handleDeleteModal = (record) => {
    setSelectedRequest(record);
    setIsOpenDeleteModal(true);
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllBoardingHDB();
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
      toast.error(t("errors.fetchImages"));
    }
  };


  const fetchFilterData = async () => {
    setLoading(true);
    try {
      const response = await filterBH({
        ...filterValue,
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      });
      console.log("Filter response:", response); // Thêm log ở đây để kiểm tra

      if (response?.data) {
        setBoardingHData(response.data);
        setPagination({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          totalItems: response.pagination.totalItems,
          limit: response.pagination.limit,
        });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to fetch filter data.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFilterData();
  }, [filterValue, paginationOptions]);

  // Handle page change
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };
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
            (p) => p.name === formData.address.province.name
          );
          if (selectedProvince) {
            const districtsData = await fetchDistricts(selectedProvince.id);
            setDistricts(districtsData);

            // Nếu đã chọn quận, fetch wards
            if (formData?.address?.district) {
              const selectedDistrict = districtsData.find(
                (d) => d.name === formData.address.district.name
              );
              if (selectedDistrict) {
                const wardsData = await fetchWards(selectedDistrict.id);
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
  const handleInputChange = ({ target: { name, value } }) => {
    const keys = name.split(".");

    if (keys.length === 2) {
      setUpdatedData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
    } else if (keys.length === 3) {
      setUpdatedData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: {
            ...prev[keys[0]]?.[keys[1]],
            [keys[2]]: value,
          },
        },
      }));
    } else {
      setUpdatedData((prev) => ({
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
      toast.error(t("errors.enterBoardingHouseName"));
      return;
    }
    if (!formData.address.province) {
      toast.error(t("errors.selectProvince"));
      return;
    }
    if (formData.otherImages.length > 15) {
      toast.error(t("errors.maxOtherImages"));
      return;
    }
    if (!formData.address.district) {
      toast.error(t("errors.selectDistrict"));
      return;
    }
    if (!formData.address.ward) {
      toast.error(t("errors.selectWard"));
      return;
    }
    if (!formData.address.detail) {
      toast.error(t("validation.enterDetailAddress"));
      return;
    }
    try {
      if (!formData._id) {
        toast.error(t("errors.invalidFormData"));
        return;
      }

      const allImages = [];
      if (formData.primaryImage) allImages.push(formData.primaryImage);
      if (formData.otherImages.length > 15) {
        toast.error("You can't upload more than 15 other images.");
        return;
      }
      allImages.push(...formData.otherImages);
      if (allImages.length === 0) {
        toast.error("You must upload at least one image.");
        return;
      }
      let form = {
        ownerUsername: formData.owner,
        boardingHouseType: formData.boardingHouseType,
        name: formData.name,
        address: {
          province: {
            id: formData.address.province.id,
            name: formData.address.province.name,
            name_en: formData.address.province.name_en
          },
          district: {
            id: formData.address.district.id,
            name: formData.address.district.name,
            name_en: formData.address.district.name_en
          },
          ward: {
            id: formData.address.ward.id,
            name: formData.address.ward.name,
            name_en: formData.address.ward.name_en
          },
          detail: formData.address.detail
        },
        description: formData.description,
        // images: imagesData,
        priceRange: formData.priceRange,
        electricityPrice: formData.electricityPrice,
        waterPrice: formData.waterPrice,
        location: {
          lat: geoLocation?.lat,
          lon: geoLocation?.lon,
        },
      };
      allImages.forEach((file, index) => {
        // form.append("boardingHouse", file);
        form = { ...form, boardingHouse: file }
      });
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
        toast.success(t("messages.deleteSuccess"));
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
  const navigate = useNavigate();

  // mở form details
  const onProcessData = async (record) => {

    navigate(`/dashboard/bh-management/${record._id}`);
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
      title: t("boardingHouseAdmin.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("boardingHouseAdmin.address"),
      dataIndex: "address",
      key: "address",
      width: 200,
      render: (text) =>
        text ? (
          <Tooltip title={getLocalizedAddress(text, currentLanguage)}>
            {getLocalizedAddress(text, currentLanguage)}
          </Tooltip>
        ) : (
          t('messages.noData')
        ),
    },
    {
      title: t("boardingHouseAdmin.priceRange"),
      dataIndex: "priceRange",
      key: "priceRange",
      render: (text) => `${formatAmount(text)}`,
    },
    // {
    //   title: t("boardingHouseAdmin.boardingHouseType"),
    //   dataIndex: "boardingHouseType",
    //   key: "boardingHouseType",
    //   render: (text) => (text ? text.name : ""),
    // },
    {
      title: t('boardingHouseAdmin.boardingHouseType'),
      dataIndex: 'boardingHouseType',
      key: 'boardingHouseType',
      render: (type) => {
        if (!type) return t('messages.noData');
        return t(`boardingHouseTypes.${type.name}`) || t('messages.noData');
      },
    },
    {
      title: t("boardingHouseAdmin.totalRooms"),
      dataIndex: "totalRooms",
      key: "totalRooms",
    },
    {
      title: t("boardingHouseAdmin.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => convertTimetap(text),
    },
    {
      title: t("boardingHouseAdmin.action"),
      key: "action",
      render: (text, record) => (
        <div className="flex gap-3">
          <Button
            title={t("boardingHouseAdmin.delete")}
            btnDelete
            className="btn-delete"
            onClick={() => handleDeleteModal(record)}
          />
          <Button
            onClick={() => onProcessData(record)}
            title={t("boardingHouseAdmin.update")}
            icon={<FileTextOutlined />}
            className="text-white"
            bgColor="rgb(5 150 105)"
          />
        </div>
      ),
    },
  ];
  const handleTableChange = (pagination, filters, sorter) => {
    const newPaginationOptions = {
      ...paginationOptions,
      page: pagination.current,
      limit: pagination.pageSize,
    };
    setPaginationOptions(newPaginationOptions);
  };
  const tablePaginationConfig = useMemo(() => ({
    current: pagination.currentPage,
    pageSize: pagination.limit,
    total: pagination.totalItems,
    showSizeChanger: true,
    showTotal: (total, range) => (
      <span
        style={{
          color: darkMode ? "#ffffff" : "#000000",
        }}
      >
        {t("boardingHouseAdmin.pagination.showTotal", {
          start: range[0],
          end: range[1],
          total,
        })}
      </span>
    ),
  }), [pagination, t]);
  return (
    <div className="boarding-house-management">
      <div className="flex justify-between mb-4">
        <Button
          btnAdd
          title={t("boardingHouseAdmin.addNew")}
          size="large"
          onClick={handleOpenForm}
        />

        <FilterBoardingHouse
          setFilterValue={setFilterValue}
          boardingHouseTypes={boardingHouseTypes}
        />
      </div>
      <Table
        columns={columns}
        data={boardingHData}
        loading={loading}
        onChange={handleTableChange}
        pagination={tablePaginationConfig}
      />

      <ConfirmModal
        title={t("boardingHouseAdmin.confirmDeletion.title")}
        content={t("boardingHouseAdmin.confirmDeletion.content", {
          name: selectedRequest?.name || t("boardingHouseAdmin.delete"),
        })}
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
        <BHDetailAdmin
          formData={formData}
          provinces={provinces}
          districts={districts}
          wards={wards}
          boardingHouseTypes={boardingHouseTypes}
          geoLocation={geoLocation}
          setGeoLocation={setGeoLocation}
          images={images}
          handleInputChange={handleInputChange}
          handleSelectedTypesChange={handleSelectedTypesChange}
          handleRemovePrimaryImage={handleRemovePrimaryImage}
          handleRemoveOtherImage={handleRemoveOtherImage}
          handleFileChange={handleFileChange}
          handleImageDelete={handleImageDelete}
          uploadProps={uploadProps}
          uploadOtherImgProps={uploadOtherImgProps}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
        />
      )}
    </div>
  );
}

export default BoardingHouseManagement;
