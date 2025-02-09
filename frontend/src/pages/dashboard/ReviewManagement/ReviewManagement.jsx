import { useEffect, useState } from "react";
import {
  TableCustom as Table,
  Button,
  ConfirmModal,
  Loader,
} from "../../../component";
import { toast } from "react-toastify";
import {
  getReviews,
  filterReviews,
  deleteReview,
} from "../../../api/ReviewManagement";
import FilterReview from "./FilterReview";

function ReviewManagement() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterValue, setFilterValue] = useState();

  // cột của bảng
  const columns = [
    {
      title: "Boarding House Name",
      dataIndex: "boardingHouseId",
      key: "boardingHouseId",
      render: (house) => house?.name || "N/A",
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => <span style={{ color: [rating] }}>{rating} / 5</span>,
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("en-GB"),
    },
    {
      title: "Reviewer",
      dataIndex: "accountId",
      key: "accountId",
      render: (account) => account?.username || "N/A",
    },
    {
      title: "Action",
      render: (record) => (
        <Button
          title={"Delete"}
          btnDelete
          className="btn-delete"
          onClick={() => handleDeleteModal(record)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const filterReview = async () => {
    setLoading(true);
    try {
      const res = await filterReviews(filterValue);
      if (Array.isArray(res)) {
        setData(res);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch filtered accounts:", error);
      toast.error("Failed to fetch filtered accounts. Please try again later.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterReview();
  }, [filterValue]);

  // hàm lấy data
  const fetchData = async () => {
    try {
      const res = await getReviews();
      if (res) {
        setData(res);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Failed to fetch withdrawal requests:", error);
      toast.error(
        "Failed to fetch withdrawal requests. Please try again later."
      );
      setData([]);
    }
  };

  const handleDeleteModal = (record) => {
    setSelectedReview(record);
    setIsOpenDeleteModal(!isOpenDeleteModal);
  };

  //thêm hàm delete đây

  const handleDelete = async () => {
    try {
      const response = await deleteReview(selectedReview?._id);
      if (response) {
        setIsOpenDeleteModal(!isOpenDeleteModal);
        fetchData();
        toast.success("Delete review successful");
      } else {
        toast.error(
          "Failed to delete review. Server response was not successful."
        );
      }
    } catch (error) {
      toast.error("An error occurred : ", error.response.data.error);
    }
  };
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, []);

  return (
    <div className="txt">
      <div className="flex justify-end mb-4">
        <FilterReview setFilterValue={setFilterValue} />
      </div>
      <div>
        <Table columns={columns} data={data} loading={loading} />
      </div>
      <ConfirmModal
        title="Confirm Deletion"
        content="Do you want to delete this review?"
        onOk={handleDelete}
        onCancel={() => setIsOpenDeleteModal(false)}
        isOpen={isOpenDeleteModal}
      />
    </div>
  );
}

export default ReviewManagement;
