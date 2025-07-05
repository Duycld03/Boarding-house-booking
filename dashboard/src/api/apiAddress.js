import axios from 'axios';

const host = " https://esgoo.net/api-tinhthanh/";

export const fetchProvinces = async () => {
    try {
        const response = await axios.get(`${host}1/0.htm`);
        // console.log("1", response);
        return response.data.data; // Ensure this structure matches your expectations
    } catch (error) {
        console.error('Error fetching provinces:', error.response || error.message);
        throw error; // Propagate the error
    }
};


export const fetchProvincesByName = async (name) => {
    try {
        const response = await axios.get(`${host}1/0.htm`);
        const provinces = response.data.data;

        return provinces.find((province) => province.name.includes(name)) || null;
    } catch (error) {
        console.error('Error fetching provinces:', error.response || error.message);
        throw error;
    }
};



export const fetchDistricts = async (provinceCode) => {
    try {
        // Check if the endpoint is correct
        const response = await axios.get(`${host}2/${provinceCode}.htm`);
        return response.data.data || []; // Ensure this matches your expected structure
    } catch (error) {
        console.error('Error fetching districts:', error.response || error.message);
        throw error;
    }
};

export const fetchWards = async (districtCode) => {
    try {
        // Check if the endpoint is correct
        const response = await axios.get(`${host}3/${districtCode}.htm`);
        return response.data.data || []; // Ensure this matches your expected structure
    } catch (error) {
        console.error('Error fetching wards:', error.response || error.message);
        throw error;
    }
};