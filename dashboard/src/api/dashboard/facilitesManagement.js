import axios from '../axios.config';

export const getFacilities = async () => {
    return await axios.get("/dashboard/facilities");
};

export const deleteFacility = async (id) => {
    return await axios.delete(`/dashboard/facilities/${id}`);
};

export const updateFacility = async (id, data) => {
    return await axios.put(`/dashboard/facilities/${id}`, data);
};

export const filterFacilities = async (filterValue) => {
    return await axios.get(`/dashboard/facilities/filter`, {
        params: filterValue,
    });
};

export const addFacility = async (newFacility) => {
    return await axios.post("/dashboard/facilities", newFacility);
}

