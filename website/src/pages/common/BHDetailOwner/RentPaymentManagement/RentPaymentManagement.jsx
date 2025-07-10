import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useParams } from "react-router-dom";
import { TableCustom as Table, Button, ConfirmModal } from "@/component";
import { toast } from "react-toastify";
import convertTimetap from "@/utils/convertTimetap";
import { Tag } from "antd";
import formatAmount, { useFormatAmount } from "@/utils/formatAmount";
import CalculateRent from "./CalculateRent";
import UpdateRentModal from "./UpdateRentModal";
import { getPaymentBillByBoardingHouseId } from "@/api/ownerUser/paymentBillAPI";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/themeContext";

const RentPaymentManagement = () => {
  // Hooks
  const { t, i18n } = useTranslation("rentPayment");
  const { darkMode } = useTheme();
  const { formatPrice } = useFormatAmount(i18n.language);
  const { boardingHouseId } = useParams();
  const currentRequestRef = useRef(null);

  // State management
  const [rentPaymentData, setRentPaymentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedPaymentBill, setSelectedPaymentBill] = useState(null);
  const [filterValue, setFilterValue] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });
  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
    sortField: "createdAt",
    sortOrder: "desc",
  });

  /**
   * Translates status values to localized strings
   */
  const translateStatus = useCallback(
    (status) => {
      const statusLower = status?.toLowerCase() || "";
      switch (statusLower) {
        case "pending":
          return t("pending");
        case "paid":
          return t("paid");
        case "deleted":
          return t("deleted");
        default:
          return t("unknown");
      }
    },
    [t]
  );

  /**
   * Fetch payment bill data with pagination and filters
   */
  const fetchPaymentBillDetails = useCallback(async () => {
    if (!boardingHouseId) return;

    setLoading(true);
    try {
      const res = await getPaymentBillByBoardingHouseId(boardingHouseId, {
        ...paginationOptions,
        ...filterValue,
      });

      if (res.success) {
        setRentPaymentData(res.data);
        setPagination({
          currentPage: res.currentPage,
          totalPages: res.totalPages,
          totalItems: res.pagination.totalItems,
          limit: res.limit,
        });
      } else {
        toast.error(res.message || t("errorLoadingData"));
        setRentPaymentData([]);
      }
    } catch (error) {
      console.error("Error fetching payment bills:", error);
      toast.error(
        error.response?.data?.message || error.message || t("errorLoadingData")
      );
      setRentPaymentData([]);
    } finally {
      setLoading(false);
    }
  }, [boardingHouseId, paginationOptions, filterValue, t]);

  /**
   * Handle table change events (sorting, pagination, filters)
   */
  const handleTableChange = useCallback(
    (pagination, filters, sorter) => {
      const newPaginationOptions = {
        ...paginationOptions,
        page: pagination.current,
        limit: pagination.pageSize,
      };

      // Handle sorting
      if (sorter && sorter.field) {
        newPaginationOptions.sortField = sorter.field;
        newPaginationOptions.sortOrder =
          sorter.order === "descend" ? "desc" : "asc";
      }

      setPaginationOptions(newPaginationOptions);
    },
    [paginationOptions]
  );

  // Fetch data when dependencies change
  useEffect(() => {
    fetchPaymentBillDetails();
  }, [fetchPaymentBillDetails]);

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
        title: t("roomNumber"),
        dataIndex: "roomNumber",
        key: "roomNumber",
        sorter: true,
      },
      {
        title: t("monthlyRent"),
        dataIndex: "rentMonth",
        key: "rentMonth",
        sorter: true,
      },
      {
        title: t("status"),
        dataIndex: "status",
        key: "status",
        sorter: true,
        render: (status) => {
          const statusLower = status?.toLowerCase() || "";
          let color;
          if (statusLower === "pending") color = "orange";
          else if (statusLower === "paid") color = "green";
          else if (statusLower === "deleted") color = "volcano";
          else color = "red";

          return <Tag color={color}>{translateStatus(status)}</Tag>;
        },
      },
      {
        title: t("additionalFee"),
        dataIndex: "additionalFee",
        key: "additionalFee",
        sorter: true,
        render: (price) => (price ? formatPrice(price) : formatPrice(0)),
      },
      {
        title: t("electricalBill"),
        dataIndex: "electricalBill",
        key: "electricalBill",
        sorter: true,
        render: (price) => {
          if (price && typeof price === "object" && price.totalAmount) {
            return formatPrice(price.totalAmount);
          } else if (typeof price === "number") {
            return formatPrice(price);
          }
          return t("notApplicable");
        },
      },
      {
        title: t("waterBill"),
        dataIndex: "waterBill",
        key: "waterBill",
        sorter: true,
        render: (price) => {
          if (price && typeof price === "object" && price.totalAmount) {
            return formatPrice(price.totalAmount);
          } else if (typeof price === "number") {
            return formatPrice(price);
          }
          return t("notApplicable");
        },
      },
      {
        title: t("paymentAmount"),
        dataIndex: "paymentAmount",
        key: "paymentAmount",
        sorter: true,
        render: (price) => (price ? formatPrice(price) : t("notApplicable")),
      },
      {
        title: t("actions"),
        key: "actions",
        render: (_, record) => {
          const isPending = record.status?.toLowerCase() === "pending";
          return isPending ? (
            <Button
              btnUpdate
              title={t("update")}
              onClick={() => handleOpenUpdateModal(record)}
            />
          ) : null;
        },
      },
    ],
    [t, formatPrice, translateStatus]
  );

  // Memoized pagination configuration for Table component
  const tablePaginationConfig = useMemo(
    () => ({
      current: pagination.currentPage,
      pageSize: pagination.limit,
      total: pagination.totalItems,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ["10", "20", "50", "100"],
    }),
    [pagination, t]
  );

  /**
   * Handle opening update modal
   */
  const handleOpenUpdateModal = useCallback(
    (record) => {
      if (!record._id) {
        toast.error(t("missingPaymentId"));
        return;
      }
      setSelectedPaymentBill(record);
      setIsUpdateModalOpen(true);
    },
    [t]
  );

  /**
   * Handle opening calculate rent modal
   */
  const handleOpenCalculateModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <div
      className={`container mx-auto py-8 px-4 ${
        darkMode ? "bg-gray-700 text-text-dark" : "text-text-light"
      }`}
    >
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3">
          <Button
            btnAdd
            title={t("calculateMonthly")}
            size="large"
            onClick={handleOpenCalculateModal}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        tableName={t("tableName")}
        columns={columns}
        data={rentPaymentData}
        loading={loading}
        onChange={handleTableChange}
        pagination={tablePaginationConfig}
        emptyText={t("noRentData")}
      />

      {/* Modals */}
      <CalculateRent
        visible={isOpen}
        setVisible={setIsOpen}
        boardingHouseId={boardingHouseId}
        fetchRentPaymentData={fetchPaymentBillDetails}
      />

      <UpdateRentModal
        visible={isUpdateModalOpen}
        setVisible={setIsUpdateModalOpen}
        paymentBill={selectedPaymentBill}
        boardingHouseId={boardingHouseId}
        fetchRentPaymentData={fetchPaymentBillDetails}
      />
    </div>
  );
};

export default RentPaymentManagement;
