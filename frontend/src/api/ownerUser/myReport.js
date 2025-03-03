import axios from "../axios.config";

export const getMyReport = async () => {
    const response = await axios.get("/reports");
    return response.data;
}