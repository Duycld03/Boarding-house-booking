import axios from 'axios';

const host = "https://provinces.open-api.vn/api/";

// Hàm lấy danh sách tỉnh/thành phố
export const fetchProvinces = async () => {
    try {
        const response = await axios.get(`${host}?depth=1`);
        return response.data; // Trả về danh sách tỉnh/thành phố
    } catch (error) {
        console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error.response?.data || error.message);
        throw new Error('Không thể lấy danh sách tỉnh/thành phố');
    }
};

// Hàm lấy danh sách quận/huyện theo mã tỉnh
export const fetchDistricts = async (provinceCode) => {
    try {
        const response = await axios.get(`${host}p/${provinceCode}?depth=2`);
        return response.data.districts || []; // Trả về danh sách quận/huyện hoặc mảng rỗng nếu không có
    } catch (error) {
        console.error('Lỗi khi lấy danh sách quận/huyện:', error.response?.data || error.message);
        throw new Error('Không thể lấy danh sách quận/huyện');
    }
};

// Hàm lấy danh sách phường/xã theo mã quận/huyện
export const fetchWards = async (districtCode) => {
    try {
        const response = await axios.get(`${host}d/${districtCode}?depth=2`);
        return response.data.wards || []; // Trả về danh sách phường/xã hoặc mảng rỗng nếu không có
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phường/xã:', error.response?.data || error.message);
        throw new Error('Không thể lấy danh sách phường/xã');
    }
};