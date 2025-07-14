import axios from 'axios';

const host = 'https://esgoo.net/api-tinhthanh/';

export const fetchProvincesByName = async (name) => {
  try {
    const response = await axios.get(`${host}?depth=1`);
    const provinces = response.data;

    return provinces.find((province) => province.name.includes(name)) || null;
  } catch (error) {
    console.error('Error fetching provinces:', error.response || error.message);
    throw error;
  }
};

export const fetchProvinces = async () => {
  try {
    const response = await axios.get(`${host}1/0.htm`);
    const data = response.data.data; // ✅ Lấy đúng mảng `data`

    return data.map((item) => ({
      id: item.id,
      name: {
        vi: item.name,
        en: item.name_en,
      },
    }));
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw error;
  }
};

export const fetchDistricts = async (provinceId) => {
  try {
    const response = await axios.get(`${host}2/${provinceId}.htm`);
    return response.data.data.map((item) => ({
      id: item.id,
      name: { vi: item.name, en: item.name_en },
    }));
  } catch (error) {
    console.error('Error fetching districts:', error.response || error.message);
    throw error;
  }
};

export const fetchWards = async (districtCode) => {
  try {
    const response = await axios.get(`${host}3/${districtCode}.htm`);
    return response.data.data.map((item) => ({
      id: item.id,
      name: { vi: item.name, en: item.name_en },
    }));
  } catch (error) {
    console.error('Error fetching wards:', error.response || error.message);
    throw error;
  }
};
