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
        totalRooms: "",
        availableRooms: "",
    });

    const [loading, setLoading] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [boardingHouseTypes, setBoardingHouseTypes] = useState([]);
    const [primaryImage, setPrimaryImage] = useState(null);
    const [otherImages, setOtherImages] = useState([]);

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
            availableRooms: formData.availableRooms,
            totalRooms: formData.totalRooms
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
                // Kiểm tra nếu nhấn vào vùng bên ngoài form
                if (e.target === e.currentTarget) {
                    onClose(); // Gọi hàm đóng form
                }
            }}
        >

            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg"
            >
                <h2 className="text-2xl font-bold mb-4">Create New Boarding House</h2>
                <div className="grid-cols-1 gap-4 mb-4">
                    <div>
                        <label className="text-2xl ">Owner</label>
                        <input
                            type="text"
                            name="owner"
                            value={formData.owner}
                            onChange={handleInputChange}
                            className="w-full border rounded px-2 py-1 mb-4"
                            placeholder="Enter owner's username"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-2xl">Boarding House Type</label>
                        <select
                            name="boardingHouseType"
                            value={formData.boardingHouseType}
                            onChange={(e) => setFormData((prev) => ({ ...prev, boardingHouseType: e.target.value }))}
                            className="w-full border rounded px-2 py-1 mb-4"
                            required
                        >
                            <option value="" disabled>
                                Select Type
                            </option>
                            {boardingHouseTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-2xl" >Name Boarding House</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full border rounded px-2 py-1 mb-4"
                            placeholder="Enter boarding house name"
                            required
                        />
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
                        <label className="text-2xl">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full border rounded px-2 py-1 mb-4"
                            placeholder="Enter description"
                        ></textarea>
                    </div>

                    <div className="p-6">
                        {/* Upload Primary Image */}
                        <div className="mb-6">
                            <label className="block font-semibold mb-2 text-2xl">Primary Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, true)}
                                className="w-full border rounded px-2 py-1 mb-2"
                            />
                            {formData.primaryImage && (
                                <div className="mt-2">
                                    <img
                                        src={URL.createObjectURL(formData.primaryImage)}
                                        alt="Primary"
                                        className="w-32 h-32 object-cover border rounded"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Upload Other Images */}
                        <div className="mb-6">
                            <label className="block font-semibold mb-2 text-2xl">Other Images</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, false)}
                                className="w-full border rounded px-2 py-1 mb-2"
                                multiple
                            />
                            {/* Hiển thị danh sách Other Images */}
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
                        </div>
                    </div>

                    <div>
                        <label className="text-2xl">Price Range (VND)</label>
                        <input
                            type="number"
                            name="priceRange"
                            value={formData.priceRange}
                            onChange={handleInputChange}
                            className="w-full border rounded px-2 py-1 mb-4"
                            placeholder="Enter price range"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-2xl">Electricity Price (VND)</label>
                        <input
                            type="number"
                            name="electricityPrice"
                            value={formData.electricityPrice}
                            onChange={handleInputChange}
                            className="w-full border rounded px-2 py-1 mb-4"
                            placeholder="Enter electricity price"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-2xl">Water Price (VND)</label>
                        <input
                            type="number"
                            name="waterPrice"
                            value={formData.waterPrice}
                            onChange={handleInputChange}
                            className="w-full border rounded px-2 py-1 mb-4"
                            placeholder="Enter water price"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-2xl">Total Rooms</label>
                        <input
                            type="number"
                            name="totalRooms"
                            value={formData.totalRooms}
                            onChange={handleInputChange}
                            className="w-full border rounded px-2 py-1 mb-4"
                            placeholder="Enter total rooms"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-2xl">Available Rooms</label>
                        <input
                            type="number"
                            name="availableRooms"
                            value={formData.availableRooms}
                            onChange={handleInputChange}
                            className="w-full border rounded px-2 py-1 mb-4"
                            placeholder="Enter available rooms"
                            required
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <Button
                        title="Cancel"
                        btnCancel={true}
                        onClick={onClose}
                        className="bg-red-500 hover:bg-red-600 w-full text-white mr-4"
                        size="large"
                    />

                    <Button
                        className="bg-primary w-full text-white ml-4"
                        size="large"
                        onClick={handleSubmit}
                        title="Submit"
                    >
                        Submit
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default AddBoardingHouseForm;