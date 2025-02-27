import Table from "../../../component/Table";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { Button, ConfirmModal } from "../../../component";
import {
  getAllAccount,
  deleteAccount,
  filterAccount,
  updateAccount,
  createAccount,
} from "../../../api/AccountManagement";
import convertTimetap from "../../../utils/convertTimetap";
import { Avatar } from "antd";
import DefaultAvatar from "../../../assets/images/none_avatar.png";
import FilterAccount from "./FilterAccount";
import AddAccountModal from "./AddAccount";
import UpdateAccountModal from "./UpdateAccount/UpdateAccount";
import { FileTextOutlined } from "@ant-design/icons";

function AccountManagement() {
  const [accountData, setAccountData] = useState([]);
  const [selectedData, setSelectedData] = useState(undefined);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllAccount();
      if (res) {
        setAccountData(res);
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
        return (
          <Avatar
            src={avatarImage?.url ?? DefaultAvatar}
            shape="circle"
            size="large"
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
      title: "Ation",
      key: "action",
      render: (createdAt, record) => (
        <div className="flex gap-3">
          <Button
            size="large"
            btnDelete
            title={"Delete"}
            onClick={() => handleSelectDelete(record)}
          />
          <Button
            onClick={() => onProcessData(record)}
            size="large"
            title={"Detail"}
            icon={<FileTextOutlined />}
            className={" text-white"}
            bgColor={"rgb(5 150 105)"}
          />
        </div>
      ),
    },
  ];

  //Add new data
  const handleAddNewData = (data) => {
    setLoading(true);
    createAccount(data)
      .then((res) => {
        if (res) {
          fetchData();
          setLoading(false);
          toast.success("Add new account successful");
        } else {
          setLoading(false);
          toast.error("Add account failed, no response received.");
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error("An error occurred : ", error.response.data.error);
      });
  };

  //update data
  const onProcessData = (combinedData) => {
    setSelectedData(combinedData);
  };

  const handleUpdate = (value) => {
    updateAccount(selectedData?._id, value)
      .then((res) => {
        if (res) {
          fetchData();
          toast.success("Update account successful!");
        } else {
          toast.error("Update failed, no response received.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred : ", error.response.data.error);
      });
  };

  //on delete:
  const handleToggleMobal = () => {
    setIsOpen(!isOpen);
  };
  const handleSelectDelete = (record) => {
    setCurrentRecord(record);
    handleToggleMobal();
  };

  const handleCancel = () => {
    setCurrentRecord(null);
    handleToggleMobal();
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      if (!currentRecord._id) {
        toast.error("Invalid ID");
        return;
      }
      const response = await deleteAccount(currentRecord?._id);
      if (response) {
        fetchData();
        setCurrentRecord("");
        handleToggleMobal();
        toast.success("Delete account successful");
      } else {
        toast.error(
          "Failed to delete account. Server response was not successful."
        );
      }
    } catch (error) {
      toast.error(
        "An error occurred: " + error.response?.data?.error || error.message
      );
    } finally {
      setLoading(false); // Ensures loading is stopped in all cases
    }
  };

  return (
    <div className="txt">
      <>
        <div className="flex justify-between">
          <AddAccountModal onAddData={handleAddNewData} />
          <FilterAccount setFilterValue={setFilterValue} />
        </div>
        <div>
          <Table columns={columns} data={accountData} loading={loading} />
        </div>

        {/* Update and detail Account */}
        <UpdateAccountModal
          accountData={selectedData}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />

        <ConfirmModal
          title="Confirm Deletion"
          content="Do you want to delete this account report?"
          onOk={handleDelete}
          onCancel={handleCancel}
          isOpen={isOpen}
        />
      </>
    </div>
  );
}

export default AccountManagement;
