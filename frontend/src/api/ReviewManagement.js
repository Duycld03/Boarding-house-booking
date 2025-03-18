import axios from './axios.config';

export const getReviews = () => {
  return axios.get('/dashboard/reviews');
};

export const deleteReview = (reviewId) => {
  return axios.delete(`/dashboard/reviews/${reviewId}`);
};

export const filterReviews = (filterValue) => {
  return axios.get(`/dashboard/reviews/filter`, {
    params: filterValue,
  });
};

export const updateReview = (reviewId, updatedData) => {
  return axios.put(`/auth/reviews/${reviewId}`, updatedData);
};
export const getReviewsUser = () => {
  return axios.get('/auth/reviews');
};
export const addReview = (reviewData) => {
  return axios.post('/auth/reviews', reviewData);
};
export const updateReviewImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('review', imageFile);

  // console.log("Image File:", imageFile);

  try {
    const response = await axios.put('/auth/review', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // console.log("Upload Response:", response);
    return response.data;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};
export const deleteReviewUser = (reviewId) => {
  return axios.delete(`/auth/reviews/${reviewId}`);
};
export const replyReview = (replyData) => {
  return axios.post('/owner/reply', replyData);
};
export const getReplyContent = (reviewId) => {
  return axios.get(`owner/reviews/${reviewId}`);
};
export const getReviewDetail = (reviewId) => {
  return axios.get(`dashboard/review/${reviewId}`);
};
export const updateReplyReview = ({ replyId, content }) => {
  return axios.put('/owner/review/updatereply', {
    replyId,
    content,
  });
};
export const softDeleteReplyReview = (replyId) => {
  return axios.delete('/owner/review/reply', {
    data: { replyId }, // ✅ Đặt `replyId` vào `data`
  });
};
