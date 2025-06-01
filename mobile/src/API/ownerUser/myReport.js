import axios from "../axios.config";

export const getMyReport = async () => {
    const response = await axios.get("/auth/reports");
    return response.data;
}