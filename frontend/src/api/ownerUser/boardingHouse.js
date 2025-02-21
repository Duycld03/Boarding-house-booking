import axios from '../axios.config';

export const getBoardingHouseDetail = (id) => {
    return axios.get(`/boardinghouse/${id}`);
};

export const getRoomTypeByBhId = (id) => {
    return axios.get(`/boardinghouse/room-types/${id}`);
};


export const getReviewByBhId = (id) => {
    return axios.get(`/boardinghouse/reviews/${id}`);
};


export const getBhByArea = async (filterValue) => {
    return axios.get(`/boardinghouse/home/area`, {
        params: filterValue,
    });
}

export const filterBH = async (filterValue) => {
    return axios.get(`/boardinghouse/home/filter`, {
        params: filterValue,
    });
}

export const getAllBoardingHouseTypes = async () => {
    return axios.get(`/boarding-house/types`);
}

export const getBoardingHouseCountByRating = async () => {
    return axios.get(`/boardinghouse/home/rating`);
}