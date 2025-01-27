import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import AddressSelector from "../../../component/AddressSelector";
import {
  Button,
  TableCustom as Table,
  Loader,
} from "../../../component";
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
  addBoardingHouseImage,
  updateBoardingHouseImage,
  deleteBoardingHouseImage
} from "../../../api/BoardingHManagement";
import formatAmount from "../../../utils/formatAmount";
import convertTimetap from "../../../utils/convertTimetap";

function BoardingHouseManagement() {
  const [boardingHData, setBoardingHData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  // const [formData, setFormData] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [boardingHouseTypes, setBoardingHouseTypes] = useState([]);
  const [error, setError] = useState(""); // Thêm state error
  const [images, setImages] = useState([]); // Lưu danh sách ảnh
  const [formData, setFormData] = useState({

  });
  // Fetch dữ liệu danh sách Boarding House
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllBoardingHDB();
      console.log("API Response:", response);
      setBoardingHData(response || []);
    } catch (error) {
      console.error("Failed to fetch boarding houses:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchImages = async (id) => {
    try {
      const { data } = await getBoardingHouseImages(id); // Gọi API
      setImages(data); // Lưu danh sách ảnh vào state
    } catch (error) {
      console.error("Failed to fetch images:", error);
      toast.error("Failed to fetch images.");
    }
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
  // Fetch danh sách tỉnh thành
  const fetchProvincesData = async () => {
    const data = await fetchProvinces();
    setProvinces(data);
  };
  const fetchDistrictsData = async () => {
    const province = provinces.find(f => f.name === formData.address.province);

    const data = await fetchDistricts(province.code);
    console.log("test1.1: ", data);

    setDistricts(data);
    setWards([]); // Reset danh sách phường/xã
  };
  const fetchWardsData = async () => {
    const district = districts.find(f => f.name === formData?.address?.district);
    console.log("test2.1: ", districts);
    const data = await fetchWards(district.code);
    console.log("test2.2: ", data);

    setWards(data);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch provinces trước
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

  // Mở popup và lấy chi tiết Boarding House
  const handleRowClick = async (id) => {
    try {
      const { data } = await getBoardingHouseDetails(id);
      setFormData(data);
      setIsDetailOpen(true);
      fetchImages(id);

    } catch (error) {
      console.error("Failed to fetch boarding house details:", error);
      toast.error("Failed to fetch boarding house details.");
    }
  };

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

    // Cập nhật trạng thái formData
    setFormData((prevData) => ({
      ...prevData,
      [name]: { _id: value }, // Giả sử bạn lưu giá trị như một đối tượng
    }));
  };
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setFormData(null);
  };

  // Xử lý cập nhật thông tin detailsssssss
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData._id) {
        console.error("Invalid formData: Missing boarding house ID");
        toast.error("Invalid form data. Please try again.");
        return;
      }

      // Prepare data for the update
      const updateData = {
        name: formData.name || "",
        description: formData.description || "",
        priceRange: formData.priceRange || 0,
        electricityPrice: formData.electricityPrice || 0,
        waterPrice: formData.waterPrice || 0,
        address: {
          province: formData.address.province || "",
          district: formData.address.district || "",
          ward: formData.address.ward || "",
          detail: formData.address.detail || "",
        },
        boardingHouseType: formData.boardingHouseType._id || "",
      };

      // Perform the update for the boarding house
      await updateBoardingHouseDetails(formData._id, updateData);

      // Check if images need to be updated
      if (images.length > 0) {
        const newImages = images.filter((img) => !img._id); // Images that were newly added
        for (const image of newImages) {
          await addBoardingHouseImage(formData._id, {
            imageUrl: image.imageUrl,
            isPrimary: image.isPrimary || false,
          });
        }
      }

      // Refresh data and close the modal
      toast.success("Boarding house updated successfully.");
      fetchData(); // Refresh the list of boarding houses
      setIsDetailOpen(false); // Close the modal
    } catch (error) {
      console.error("Failed to update boarding house:", error);
      toast.error("Failed to update boarding house. Please try again later.");
    }
  };
  const handleImageUpload = async (e, isPrimary = false) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("No file selected.");
      return;
    }

    try {
      // Simulate upload
      const uploadedImageUrl = URL.createObjectURL(file);
      console.log("Uploaded Image URL:", uploadedImageUrl); // Debugging

      await addBoardingHouseImage(formData._id, { imageUrl: uploadedImageUrl, isPrimary });
      fetchImages(formData._id);
      toast.success("Image added successfully.");
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image.");
    }
  };

  const handleAddImage = async () => {
    try {
      setLoading(true);
      const newImage = { imageUrl: newImage, isPrimary };
      const response = await addBoardingHouseImage(boardingHouseId, newImage);
      setImages(response.data.data.images);
      setNewImageUrl("");
      setIsPrimary(false);
      setLoading(false);
    } catch (err) {
      setError("Failed to add image");
      setLoading(false);
    }
  };


  const handleImageDelete = async (imageId) => {
    try {
      // Gọi API xóa ảnh
      await deleteBoardingHouseImage(formData._id, imageId);

      // Reload danh sách ảnh sau khi xóa thành công
      fetchImages(formData._id);
      toast.success("Image deleted successfully.");
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast.error("Failed to delete image.");
    }
  };

  useEffect(() => {
    fetchData();
    fetchBoardingHouseTypes();
  }, []);

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
  ];

  return (
    <div className="boarding-house-management">
      {loading ? (
        <Loader />
      ) : (
        <>
          <h1 className=" text-2xl font-bold mb-4">Boarding House Management</h1>
          <Table
            columns={columns}
            data={boardingHData}
            onRowClick={(record) => handleRowClick(record._id)}
            loading={loading}
          />
          {isDetailOpen && formData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg w-full max-w-3xl overflow-auto"
              >
                <h2 className="overflow-auto scrollbar-thin text-xl font-bold mb-4">
                  Boarding House Detail
                </h2>
                <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                  <div>
                    <label>Name Owner</label>
                    <input
                      type="text"
                      value={formData.ownerId?.fullname || ""}
                      readOnly
                      className="w-full border rounded px-2 py-1 mb-4"
                    />
                  </div>
                  <div>
                    <label>Owner</label>
                    <input
                      type="text"
                      value={formData.ownerId?.username || ""}
                      readOnly
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label>Name Boarding House</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label>Boarding House Type</label>
                    <select
                      name="boardingHouseType"
                      value={formData.boardingHouseType?._id || ""}
                      onChange={(e) =>
                        handleSelectedTypesChange({
                          target: {
                            name: "boardingHouseType",
                            value: e.target.value,
                          },
                        })
                      }
                      className="w-full border rounded px-2 py-1"
                    >
                      {/* <option value="" disabled>
                        Select a type
                      </option> */}
                      name="boardingHouseType"
                      value={formData.boardingHouseType?._id || ""}
                      {boardingHouseTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}

                        </option>
                      ))}

                    </select>
                  </div>

                  <div className="col-span-2">
                    <label>Primary Image</label>
                    <div className="relative mb-4">
                      {images.length > 0 ? (
                        <img
                          src={
                            images.find((img) => img.isPrimary)?.imageUrl || "https://via.placeholder.com/150"
                          }
                          alt="Primary"
                          className="w-full h-48 object-cover border rounded"
                        />
                      ) : (
                        <p className="text-gray-500">No primary image available</p>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Other Images */}
                  <div className="col-span-2">
                    <label>Other Images</label>
                    <div className="overflow-x-auto flex gap-4 py-2">
                      {images
                        .filter((img) => !img.isPrimary)
                        .map((image, index) => (
                          <div key={image._id} className="relative flex-shrink-0 w-32 h-32">
                            <img
                              src={image.imageUrl}
                              alt={`Other ${index}`}
                              className="w-full h-full object-cover border rounded"
                            />
                            <button
                              type="button"
                              onClick={() => handleImageDelete(image._id)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      {/* Add New Image */}
                      <div className="w-32 h-32 flex items-center justify-center border rounded relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <span className="text-gray-500">+ Add Image</span>
                      </div>
                    </div>
                  </div>

                  <AddressSelector
                    provinces={provinces}
                    districts={districts}
                    wards={wards}
                    onProvinceChange={handleInputChange}
                    onDistrictChange={handleInputChange}
                    onInputChange={handleInputChange}
                    formData={formData}
                  />
                  <div className="col-span-2">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      className="w-full border rounded px-2 py-1"
                    ></textarea>
                  </div>
                  <div>
                    <label>Price Range (VND)</label>
                    <input
                      type="number"
                      name="priceRange"
                      value={formData.priceRange || ""}
                      onChange={handleInputChange}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label>Total Rooms</label>
                    <input
                      type="number"
                      value={formData.totalRooms || ""}
                      readOnly
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label>Available Rooms</label>
                    <input
                      type="number"
                      value={formData.availableRooms || ""}
                      readOnly
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label>Electricity Price</label>
                    <input
                      type="number"
                      name="electricityPrice"
                      value={formData.electricityPrice || ""}
                      onChange={handleInputChange}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label>Water Price</label>
                    <input
                      type="number"
                      name="waterPrice"
                      value={formData.waterPrice || ""}
                      onChange={handleInputChange}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseDetail}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BoardingHouseManagement;