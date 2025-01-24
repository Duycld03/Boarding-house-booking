import axios from 'axios';

export const getReviews = async () => {
    try {
        // Gọi đến endpoint để lấy danh sách đánh giá
        const response = await axios.get('http://localhost:3000/dashboard/admin/listReviews');
        return response; // Trả về toàn bộ response
    } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error; // Ném lỗi để xử lý ở nơi gọi hàm
    }
};
// import axios from "./axios.config";

// export const getReviews = () => {
//     return axios.get("/listReviews");
// };


