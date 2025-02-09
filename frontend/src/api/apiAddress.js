import axios from 'axios';

const host = "https://provinces.open-api.vn/api/";

export const fetchProvinces = async () => {
    try {
        const response = await axios.get(`${host}?depth=1`);
        return response.data; // Ensure this structure matches your expectations
    } catch (error) {
        console.error('Error fetching provinces:', error.response || error.message);
        throw error; // Propagate the error
    }
};

export const fetchDistricts = async (provinceCode) => {
    try {
        // Check if the endpoint is correct
        const response = await axios.get(`${host}p/${provinceCode}?depth=2`);
        return response.data.districts || []; // Ensure this matches your expected structure
    } catch (error) {
        console.error('Error fetching districts:', error.response || error.message);
        throw error;
    }
};

export const fetchWards = async (districtCode) => {
    try {
        // Check if the endpoint is correct
        const response = await axios.get(`${host}d/${districtCode}?depth=2`);
        return response.data.wards || []; // Ensure this matches your expected structure
    } catch (error) {
        console.error('Error fetching wards:', error.response || error.message);
        throw error;
    }
};