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

//import đa ngôn ngữ và theme
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/themeContext";

function AccountManagement() {
  const [accountData, setAccountData] = useState([]);
  const [selectedData, setSelectedData] = useState(undefined);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState();
  const { t } = useTranslation("accountManagement");
  const { darkMode } = useTheme();

  //Translate role
  const translateRole = (role) => {
    switch (role) {
      case "user":
        return t("role.user");
      case "owner":
        return t("role.owner");
      case "manager":
        return t("role.manager");
      case "admin":
        return t("role.admin");
      default:
        return role;
    }
  };

  //Translate status
  const translateStatus = (status) => {
    switch (status) {
      case "active":
        return t("status.active");
      case "inactive":
        return t("status.inactive");
      default:
        return status;
    }
  };

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
      toast.error(t("messages.fetchError"));
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
      toast.error(t("messages.fetchError"));
      setAccountData([]);
    } finally {
      setLoading(false);
    }
  };

  //fetch account data
  useEffect(() => {
    fetchData();
    console.log(accountData);
  }, []);

  //Filter account data
  useEffect(() => {
    filterAccountData();
  }, [filterValue]);

  // Các cột cho bảng
  const columns = [
    {
      title: t("columns.avatar"),
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
      title: t("columns.username"),
      dataIndex: "username",
      key: "username",
    },
    {
      title: t("columns.fullName"),
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: t("columns.email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("columns.role"),
      dataIndex: "role",
      key: "role",
      render: (role) => translateRole(role),
    },
    {
      title: t("columns.status"),
      dataIndex: "status",
      key: "status",
      render: (status) => translateStatus(status),
    },
    {
      title: t("columns.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => convertTimetap(createdAt),
    },
    {
      title: t("columns.action"),
      key: "action",
      render: (createdAt, record) => (
        <div className="flex gap-3">
          <Button
            size="large"
            btnDelete
            title={t("buttons.delete")}
            onClick={() => handleSelectDelete(record)}
          />
          <Button
            onClick={() => onProcessData(record)}
            size="large"
            title={t("buttons.detail")}
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
          toast.success(t("messages.addSuccess"));
        } else {
          setLoading(false);
          toast.error(t("messages.addFailed"));
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error(
          "An error occurred : " +
            (error.response?.data?.error || error.message)
        );
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
          toast.success(t("messages.updateSuccess"));
        } else {
          toast.error(t("messages.updateFailed"));
        }
      })
      .catch((error) => {
        toast.error(
          "An error occurred : " +
            (error.response?.data?.error || error.message)
        );
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
        toast.error(t("messages.invalidId"));
        return;
      }
      const response = await deleteAccount(currentRecord?._id);
      if (response) {
        fetchData();
        setCurrentRecord("");
        handleToggleMobal();
        toast.success(t("messages.deleteSuccess"));
      } else {
        toast.error(t("messages.deleteFailed"));
      }
    } catch (error) {
      toast.error(
        "An error occurred: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false); // Ensures loading is stopped in all cases
    }
  };

  return (
    <div
      className={`txt ${
        darkMode ? "bg-gray-700 text-text-dark" : " text-text-light"
      }`}
    >
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
          title={t("modals.confirmDelete.title")}
          content={t("modals.confirmDelete.content")}
          onOk={handleDelete}
          onCancel={handleCancel}
          isOpen={isOpen}
        />
      </>
    </div>
  );
}

export default AccountManagement;
