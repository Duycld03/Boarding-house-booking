import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AddressSelector from "../../../component/AddressSelector";
import {
    getAllBoardingHouseTypes,
    createBoardingHouse,
    uploadFile,
} from "../../../api/BoardingHManagement";
import {
    fetchProvinces,
    fetchDistricts,
    fetchWards,
} from "../../../api/apiAddress";
import { Loader, Button } from "../../../component";
import { Form, Input, Select, Upload, InputNumber } from "antd";
import { PlusOutlined } from "@ant-design/icons";
function AddBoardingHouseForm({ onClose, onSuccess }) {
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

    const [loading, setLoading] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [boardingHouseTypes, setBoardingHouseTypes] = useState([]);
    const [primaryImage, setPrimaryImage] = useState(null);
    const [otherImages, setOtherImages] = useState([]);
    const uploadOtherImgProps = {
        beforeUpload: (file) => {
            handleFileChange({ target: { files: [file] } }, false);
            return false; // Prevent automatic upload
        },
        multiple: true,
        accept: "image/*",
    };
    const uploadProps = {
        beforeUpload: (file) => {
            handleFileChange({ target: { files: [file] } }, true);
            return false; // Prevent automatic upload
        },
        accept: "image/*",
        maxCount: 1,
        showUploadList: false,
    };
    // Fetch provinces, districts, and wards dynamically
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
                        setWards([]);
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
        fetchBoardingHouseTypes();
    }, []);


    // Handle file uploads
    const handleFileChange = (e, isPrimary = false) => {
        const file = e.target.files[0]; // Lấy file đầu tiên
        if (!file) return;

        if (isPrimary) {
            setFormData((prev) => ({ ...prev, primaryImage: file }));
        } else {
            setFormData((prev) => ({
                ...prev,
                otherImages: [...prev.otherImages, file],
            }));
        }
    };

    const handleRemoveOtherImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            otherImages: prev.otherImages.filter((_, i) => i !== index),
        }));
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Form Data:", formData);
        // console.log("Boarding House Type:", formData.boardingHouseType);
        if (!formData.owner) {
            toast.error("Please enter owner name.");
            return;
        }
        if (!formData.boardingHouseType) {
            toast.error("Please select a boarding house type.");
            return;
        }
        if (!formData.name) {
            toast.error("Please input a boarding house name.");
            return;
        }
        if (!formData.address.province) {
            toast.error("Please input a boarding house province.");
            return;
        }
        if (!formData.address.district) {
            toast.error("Please input a boarding house district.");
            return;
        }
        if (!formData.address.ward) {
            toast.error("Please input a boarding house ward.");
            return;
        }
        if (!formData.address.detail) {
            toast.error("Please input a boarding house details.");
            return;
        }

        const imagesData = [];
        const payloadPrimary = new FormData();
        payloadPrimary.append("file", formData.primaryImage);
        try {
            // Gửi file đến BE để lưu
            const responsePrimary = await uploadFile(payloadPrimary);

            imagesData.push({
                imageUrl: responsePrimary.filePath, // Đường dẫn trả về từ BE
                isPrimary: true,
            });
        } catch (error) {
            console.error("Failed to upload image:", error);
            toast.error("Failed to upload image.");
            return;
        }

        for (const image of formData.otherImages) {
            const payload = new FormData();
            payload.append("file", image);
            try {
                // Gửi file đến BE để lưu
                const response = await uploadFile(payload);

                imagesData.push({
                    imageUrl: response.filePath, // Đường dẫn trả về từ BE
                    isPrimary: false,
                });
            } catch (error) {
                console.error("Failed to upload image:", error);
                toast.error("Failed to upload image.");
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
            // availableRooms: formData.availableRooms,
            // totalRooms: formData.totalRooms
        }
        // const form = { ...formData }

        // for (let [key, value] of formData.entries()) {
        //     form[key] = value;
        // }
        console.log("test: ", form);

        setLoading(true);
        try {
            // console.log("test: ", formData);
            await createBoardingHouse(form); // Call API to create boarding house
            toast.success("Boarding house created successfully!");
            onSuccess(); // Callback to refresh data
            onClose(); // Close the form
        } catch (error) {
            console.error("Failed to create boarding house:", error);
            toast.error(error.response?.data?.message || "Failed to create boarding house.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <Form
                layout="vertical"
                onSubmitCapture={handleSubmit}
                className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg"
            >
                <h2 className="text-2xl font-bold mb-4">Create New Boarding House</h2>

                {/* Owner */}
                <Form.Item
                    label="Owner"
                    name="owner"
                    rules={[{ required: true, message: "Please enter owner's username" }]}
                    className="mb-2"
                >
                    <Input
                        placeholder="Enter owner's username"
                        name="owner"
                        value={formData.owner}
                        onChange={handleInputChange}
                    />
                </Form.Item>

                {/* Boarding House Type */}
                <Form.Item
                    label="Boarding House Type"
                    name="boardingHouseType"
                    rules={[{ required: true, message: "Please select a boarding house type" }]}
                    className="mb-2"
                >
                    <Select
                        placeholder="Select Type"
                        value={formData.boardingHouseType}
                        onChange={(value) => setFormData((prev) => ({ ...prev, boardingHouseType: value }))}
                    >
                        {boardingHouseTypes.map((type) => (
                            <Select.Option key={type.value} value={type.value}>
                                {type.label}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Boarding House Name */}
                <Form.Item
                    label="Name Boarding House"
                    name="name"
                    rules={[{ required: true, message: "Please enter the boarding house name" }]}
                    className="mb-2"
                >
                    <Input
                        placeholder="Enter boarding house name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                </Form.Item>

                {/* Address Selector */}
                <AddressSelector
                    provinces={provinces}
                    districts={districts}
                    wards={wards}
                    onProvinceChange={handleInputChange}
                    onDistrictChange={handleInputChange}
                    onInputChange={handleInputChange}
                    formData={formData}
                />

                {/* Description */}
                <Form.Item label="Description" name="description" className="mb-2">

                    <Input.TextArea
                        placeholder="Enter description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                    />
                </Form.Item>

                {/* Primary Image */}
                <Form.Item label="Primary Image" className="mb-2">
                    <Upload {...uploadProps}>
                        <Button icon={<PlusOutlined />}>Upload Primary Image</Button>
                    </Upload>
                    {formData.primaryImage && (
                        <img
                            src={URL.createObjectURL(formData.primaryImage)}
                            alt="Primary"
                            className="mt-2 w-32 h-32 object-cover border rounded"
                        />
                    )}
                </Form.Item>

                {/* Other Images */}
                <Form.Item label="Other Images" className="mb-2">
                    <Upload {...uploadOtherImgProps} listType="picture-card" showUploadList={false}>
                        <Button icon={<PlusOutlined />}>Upload Images</Button>
                    </Upload>
                    <div className="mt-4 flex flex-wrap gap-4">
                        {formData.otherImages.map((file, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Other ${index + 1}`}
                                    className="w-32 h-32 object-cover border rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveOtherImage(index)}
                                    className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                </Form.Item>

                {/* Price Range */}
                <Form.Item
                    label="Price Range (VND)"
                    name="priceRange"
                    rules={[{ required: true, message: "Please enter the price range" }]}
                    className="mb-2"
                >
                    <InputNumber
                        placeholder="Enter price range"
                        name="priceRange"
                        value={formData.priceRange}
                        onChange={(value) =>
                            handleInputChange({ target: { name: "priceRange", value } })
                        }
                        formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        } // Thêm dấu phẩy ngăn cách hàng nghìn
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")} // Loại bỏ dấu phẩy khi nhập
                        className="w-full"
                    />
                </Form.Item>

                {/* Electricity Price */}
                <Form.Item
                    label="Electricity Price (VND)"
                    name="electricityPrice"
                    rules={[{ required: true, message: "Please enter the electricity price" }]}
                    className="mb-2"
                >
                    <InputNumber
                        placeholder="Enter electricity price"
                        name="electricityPrice"
                        value={formData.electricityPrice}
                        onChange={(value) =>
                            handleInputChange({ target: { name: "electricityPrice", value } })
                        }
                        formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        className="w-full"
                    />
                </Form.Item>

                {/* Water Price */}
                <Form.Item
                    label="Water Price (VND)"
                    name="waterPrice"
                    rules={[{ required: true, message: "Please enter the water price" }]}
                    className="mb-2"
                >
                    <InputNumber
                        placeholder="Enter water price"
                        name="waterPrice"
                        value={formData.waterPrice}
                        onChange={(value) =>
                            handleInputChange({ target: { name: "waterPrice", value } })
                        }
                        formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        className="w-full"
                    />
                </Form.Item>

                {/* Total Rooms */}
                {/* <Form.Item
                    label="Total Rooms"
                    name="totalRooms"
                    rules={[{ required: true, message: "Please enter the total number of rooms" }]}
                    className="mb-2"
                >
                    <Input
                        type="number"
                        placeholder="Enter total rooms"
                        name="totalRooms"
                        value={formData.totalRooms}
                        onChange={handleInputChange}
                    />
                </Form.Item>

                {/* Available Rooms */}
                {/* <Form.Item
                    label="Available Rooms"
                    name="availableRooms"
                    rules={[{ required: true, message: "Please enter the available rooms" }]}
                    className="mb-2"
                >
                    <Input
                        type="number"
                        placeholder="Enter available rooms"
                        name="availableRooms"
                        value={formData.availableRooms}
                        onChange={handleInputChange}
                    />
                </Form.Item> */ }

                {/* Form Buttons */}
                <div className="flex justify-end mt-4 ">
                    <Button
                        title="Cancel"
                        btnCancel={true}
                        onClick={onClose}
                        className="bg-red-500 hover:bg-red-600 text-white mr-2"
                        size="large"
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-primary w-full text-white ml-2"
                        size="large"
                        onClick={handleSubmit}
                        title="Submit"
                    >
                        Submit
                    </Button>

                </div>
            </Form>
        </div>
    );
};

export default AddBoardingHouseForm;