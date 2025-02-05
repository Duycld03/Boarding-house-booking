// Hàm cắt chuỗi nếu dài hơn 25 ký tự
const truncateDetail = (detail, length = 15) => {
  if (detail.length > length) {
    return `${detail.slice(0, length)}...`; // Cắt chuỗi và thêm dấu ba chấm
  }
  return detail;
};
export default truncateDetail;
