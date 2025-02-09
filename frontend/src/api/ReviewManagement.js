import axios from "./axios.config";

export const getReviews = () => {
    return axios.get("/dashboard/reviews");
};

export const deleteReview = (reviewId) => {
    return axios.delete(`/dashboard/reviews/${reviewId}`);
};

export const filterReviews = (filterValue) => {
    return axios.get(`/dashboard/reviews/filter`, {
        params: filterValue,
    });
};

