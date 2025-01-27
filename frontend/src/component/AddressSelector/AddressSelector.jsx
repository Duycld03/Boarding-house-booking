import React from "react";

const AddressSelector = ({
    provinces = [],
    districts = [],
    wards = [],
    onProvinceChange,
    onDistrictChange,
    onInputChange,
    formData,
}) => {
    return (
        <div className="col-span-2">
            <label className="block text-3xl font-semibold mb-2">Address</label>
            <div className="mb-4">
                <label className="block mb-1">Tỉnh/Thành phố</label>
                <select
                    name="address.province"
                    value={formData?.address?.province || ""}
                    onChange={(e) => {
                        onProvinceChange(e); // Fetch districts
                        onInputChange(e); // Update province in formData
                    }}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {provinces.map((province) => (
                        <option key={province.code} value={province.name}>
                            {province.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block mb-1">Quận/Huyện</label>
                <select
                    name="address.district"
                    value={formData?.address?.district || ""}
                    onChange={(e) => {
                        onDistrictChange(e); // Fetch wards
                        onInputChange(e); // Update district in formData
                    }}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!formData?.address?.province}
                >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((district) => (
                        <option key={district.code} value={district.name}>
                            {district.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block mb-1">Phường/Xã</label>
                <select
                    name="address.ward"
                    value={formData?.address?.ward || ""}
                    onChange={onInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!formData?.address?.district}
                >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((ward) => (
                        <option key={ward.code} value={ward.name}>
                            {ward.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block mb-1">Địa chỉ chi tiết</label>
                <textarea
                    name="address.detail"
                    value={formData?.address?.detail || ""}
                    onChange={onInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập địa chỉ chi tiết"
                ></textarea>
            </div>
        </div>
    );
};

export default AddressSelector;