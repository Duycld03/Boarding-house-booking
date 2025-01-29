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
        <div className="grid grid-cols-1 gap-4">
            <div>
                <label className="block mb-1 text-2xl">Province</label>
                <select
                    name="address.province"
                    value={formData?.address?.province || ""}
                    onChange={(e) => {
                        onProvinceChange(e); // Fetch districts
                        onInputChange(e); // Update province in formData
                    }}
                    required
                    className="w-full border rounded px-2 py-1"
                >
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                        <option key={province.code} value={province.name}>
                            {province.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block mb-1 text-2xl">District</label>
                <select
                    name="address.district"
                    value={formData?.address?.district || ""}

                    onChange={(e) => {
                        onDistrictChange(e); // Fetch wards
                        onInputChange(e); // Update district in formData
                    }}
                    required
                    className="w-full border rounded px-2 py-1"
                    disabled={!formData?.address?.province}
                >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                        <option key={district.code} value={district.name}>
                            {district.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block mb-1 text-2xl">Ward</label>
                <select
                    name="address.ward"
                    value={formData?.address?.ward || ""}
                    onChange={onInputChange}
                    required
                    className="w-full border rounded px-2 py-1"
                    disabled={!formData?.address?.district}
                >
                    <option value="">Select Ward</option>
                    {wards.map((ward) => (
                        <option key={ward.code} value={ward.name}>
                            {ward.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block mb-1 text-2xl">Detail</label>
                <textarea
                    name="address.detail"
                    value={formData?.address?.detail || ""}
                    onChange={onInputChange}
                    required
                    className="w-full border rounded px-2 py-1"
                    placeholder="Enter address details"
                ></textarea>
            </div>
        </div >
    );
};

export default AddressSelector;