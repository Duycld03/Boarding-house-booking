import Table from "../../../component/Table";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { Button, ConfirmModal } from "../../../component";
import {
  getAllAccount,
  deleteAccount,
  filterAccount,
} from "../../../api/AccountManagement";
import convertTimetap from "../../../utils/convertTimetap";
import { Avatar } from "antd";
import DefaultAvatar from "../../../assets/images/none_avatar.png";
import FilterAccount from "./FilterAccount";

function AccountManagement() {
  const [accountData, setAccountData] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [filterValue, setFilterValue] = useState({
    gender: null,
    role: null,
    startDate: null,
    endDate: null,
    status: null,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllAccount();
      if (res) {
        setAccountData(res);
        console.log(res);
      } else {
        setAccountData([]);
      }
    } catch (error) {
      console.error("Failed to fetch withdrawal requests:", error);
      toast.error(
        "Failed to fetch withdrawal requests. Please try again later."
      );
      setAccountData([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAccountData = async () => {
    setLoading(true);
    try {
      const res = await filterAccount(filterValue);
      if (Array.isArray(res)) {
        setAccountData(res);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch filtered accounts:", error);
      toast.error("Failed to fetch filtered accounts. Please try again later.");
      setAccountData([]);
    } finally {
      setLoading(false);
    }
  };

  //fetch account data
  useEffect(() => {
    fetchData();
  }, []);

  //Filter account data
  useEffect(() => {
    filterAccountData();
  }, [filterValue]);

  // Các cột cho bảng
  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatarImage",
      key: "avatarImage",
      render: (avatarImage) => {
        const resolvedSrc = avatarImage
          ? `http://localhost:3000/${avatarImage}`
          : DefaultAvatar;
        return (
          <Avatar
            src={resolvedSrc}
            shape="circle"
            size="large"
            onError={(e) => (e.target.src = DefaultAvatar)}
          />
        );
      },
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Full Name",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => convertTimetap(createdAt),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          title={"Delete"}
          onClick={() => {
            handleToggleMobal();
            setCurrentRecord(record);
          }}
          btnDelete
        >
          Delete
        </Button>
      ),
    },
  ];

  useEffect(() => {
    console.log("filter value: ", filterValue);
  }, [filterValue]);

  const onProcessData = (combinedData) => {
    console.log("Processed Data: ", combinedData);
  };

  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleMobal = () => {
    setIsOpen(!isOpen);
  };

  const handleDelete = async () => {
    try {
      await deleteAccount(currentRecord._id);
      fetchData();
      handleToggleMobal();
      toast.success("Delete account successful");
    } catch (error) {
      toast.error("Failed: ", error);
    }
  };

  return (
    <div className="txt">
      <>
        <div className="flex justify-between">
          <Button size="large" btnAdd title="Add new" />
          <FilterAccount setFilterValue={setFilterValue} />
        </div>
        <div>
          <Table
            columns={columns}
            data={accountData}
            onRowClick={onProcessData}
            loading={loading}
          />
        </div>
        <ConfirmModal
          onCancel={handleToggleMobal}
          isOpen={isOpen}
          onOk={handleDelete}
          content={"Do you want to add new?"}
        />
      </>
    </div>
  );
}

export default AccountManagement;
