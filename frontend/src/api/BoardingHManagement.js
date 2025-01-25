import axios from "./axios.config";

export const getAllBoardingHDB = () => {
  return axios.get("/dashboard/boardinghouse");
};
