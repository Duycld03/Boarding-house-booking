import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Avatar, Pagination } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";

// Components
import Table from "../../../component/Table";
import { Button, ConfirmModal } from "../../../component";
import FilterAccount from "./FilterAccount";
import AddAccountModal from "./AddAccount";
import UpdateAccountModal from "./UpdateAccount/UpdateAccount";

// API and utils
import {
  deleteAccount,
  filterAccount,
  updateAccount,
  createAccount,
} from "../../../api/AccountManagement";
import convertTimetap from "../../../utils/convertTimetap";

// Assets
import DefaultAvatar from "../../../assets/images/none_avatar.png";

// Translations and theme
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/themeContext";

/**
 * AccountManagement Component
 * Manages the display and operations for user accounts
 */
function AccountManagement() {
  // State management
  const [accountData, setAccountData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });
  const [selectedData, setSelectedData] = useState(undefined);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState({});
  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
    sortField: "createdAt",
    sortOrder: "desc",
  });

  // Hooks
  const { t } = useTranslation("accountManagement");
  const { darkMode } = useTheme();
  const currentRequestRef = useRef(null);

  /**
   * Translates role values to localized strings
   * @param {string} role - Role value to translate
   * @returns {string} Translated role text
   */
  const translateRole = useCallback(
    (role) => {
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
    },
    [t]
  );

  /**
   * Translates status values to localized strings
   * @param {string} status - Status value to translate
   * @returns {string} Translated status text
   */
  const translateStatus = useCallback(
    (status) => {
      switch (status) {
        case "active":
          return t("status.active");
        case "inactive":
          return t("status.inactive");
        default:
          return status;
      }
    },
    [t]
  );

  const filterAccountData = useCallback(async () => {
    try {
      const res = await filterAccount(filterValue, paginationOptions);

      if (res) {
        setAccountData(res.data);
        setPagination({
          currentPage: res.currentPage,
          totalPages: res.totalPages,
          totalItems: res.pagination.totalItems,
          limit: res.limit,
        });
      } else {
        toast.error(t("messages.fetchFailed"));
      }
    } catch (error) {
      toast.error(
        "An error occurred: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  }, [filterValue, paginationOptions, t]);

  // Handle table change events (sorting, pagination)
  const handleTableChange = useCallback(
    (pagination, filters, sorter) => {
      const newPaginationOptions = {
        ...paginationOptions,
        page: pagination.current,
        limit: pagination.pageSize,
      };

      setPaginationOptions(newPaginationOptions);
    },
    [paginationOptions]
  );

  // Filter account data when filterValue or paginationOptions change
  useEffect(() => {
    filterAccountData();
  }, [filterAccountData]);

  // Clean up any pending requests when component unmounts
  useEffect(() => {
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.cancel("Component unmounted");
      }
    };
  }, []);

  // Table columns configuration - memoized to prevent unnecessary re-renders
  const columns = useMemo(
    () => [
      {
        title: t("columns.avatar"),
        dataIndex: "avatarImage",
        key: "avatarImage",
        render: (avatarImage) => (
          <Avatar
            src={avatarImage?.url ?? DefaultAvatar}
            shape="circle"
            size="large"
          />
        ),
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

        defaultSortOrder: "descend",
      },
      {
        title: t("columns.action"),
        key: "action",
        render: (record) => (
          <div className="flex gap-3">
            <Button
              btnDelete
              title={t("buttons.delete")}
              onClick={() => handleSelectDelete(record)}
            />
            <Button
              onClick={() => onProcessData(record)}
              btnUpdate
              title={t("buttons.update")}
              icon={<FileTextOutlined />}
            />
          </div>
        ),
      },
    ],
    [t, translateRole, translateStatus]
  );

  // Memoized pagination configuration for Table component
  const tablePaginationConfig = useMemo(
    () => ({
      current: pagination.currentPage,
      pageSize: pagination.limit,
      total: pagination.totalItems,
      showSizeChanger: true,
    }),
    [pagination, t, darkMode]
  );

  /**
   * Add new account handler
   * @param {Object} data - New account data
   */
  const handleAddNewData = useCallback(
    (data) => {
      setLoading(true);
      createAccount(data)
        .then((res) => {
          if (res) {
            filterAccountData();
            toast.success(t("messages.addSuccess"));
          } else {
            toast.error(t("messages.addFailed"));
          }
        })
        .catch((error) => {
          toast.error(
            `An error occurred: ${error.response?.data?.error || error.message}`
          );
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [filterAccountData, t]
  );

  /**
   * Set selected data for update
   * @param {Object} data - Selected account data
   */
  const onProcessData = useCallback((data) => {
    setSelectedData(data);
  }, []);

  /**
   * Update account handler
   * @param {Object} value - Updated account data
   */
  const handleUpdate = useCallback(
    (value) => {
      if (!selectedData?._id) {
        toast.error(t("messages.invalidId"));
        return;
      }

      setLoading(true);
      updateAccount(selectedData._id, value)
        .then((res) => {
          if (res) {
            filterAccountData(); // Refresh with current filters
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
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [selectedData, filterAccountData, t]
  );

  /**
   * Set current record for deletion and open confirm modal
   * @param {Object} record - Account record to delete
   */
  const handleSelectDelete = useCallback((record) => {
    setCurrentRecord(record);
    setIsOpen(true);
  }, []);

  /**
   * Handle cancel delete operation
   */
  const handleCancel = useCallback(() => {
    setCurrentRecord(null);
    setIsOpen(false);
  }, []);

  /**
   * Handle delete operation
   */
  const handleDelete = useCallback(async () => {
    if (!currentRecord?._id) {
      toast.error(t("messages.invalidId"));
      return;
    }

    setLoading(true);
    try {
      const response = await deleteAccount(currentRecord._id);
      if (response) {
        filterAccountData(); // Refresh with current filters
        setCurrentRecord(null);
        setIsOpen(false);
        toast.success(t("messages.deleteSuccess"));
      } else {
        toast.error(t("messages.deleteFailed"));
      }
    } catch (error) {
      toast.error(
        "An error occurred: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  }, [currentRecord, filterAccountData, t]);

  return (
    <div
      className={`txt ${
        darkMode ? "bg-gray-700 text-text-dark" : "text-text-light"
      }`}
    >
      <>
        <div className="flex justify-between mb-4">
          <AddAccountModal onAddData={handleAddNewData} />
          <FilterAccount setFilterValue={setFilterValue} />
        </div>

        <div>
          <Table
            tableName={t("tableName")}
            columns={columns}
            data={accountData}
            loading={loading}
            onChange={handleTableChange}
            pagination={tablePaginationConfig}
            noDataText={t("messages.noData")}
          />
        </div>

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
