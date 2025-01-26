import axios from "./axios.config";

export const getReviews = () => {
    return axios.get("/dashboard/listReviews");
};


