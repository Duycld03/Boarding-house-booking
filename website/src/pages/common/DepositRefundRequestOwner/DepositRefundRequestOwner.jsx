import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { TableCustom as Table, Button, ConfirmModal } from "../../../component";
import formatAmount from "../../../utils/formatAmount";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader } from "../../../component";
import { Tag } from "antd";
import { toast } from "react-toastify";
import {
  getRefundRequests,
  cancelRefundRequestsForOwner,
} from "@/api/ownerUser/refundRequestAPI";
import { Input, Modal, Form } from "antd";
import DepositRefundPopup from "./DepositRefundPopup";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

function DepositRefundRequestOwner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("depositRefundRequest");
  const { darkMode } = useTheme();
  const currentRequestRef = useRef(null);

  // State management
  const [loading, setLoading] = useState(false);
  const [refundRequests, setRefundRequests] = useState([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [reasonForCancel, setReasonForCancel] = useState("");
  const [selectedRefundRequest, setSelectedRefundRequest] = useState(null);
  const [isDepositRefundPopupOpen, setIsDepositRefundPopupOpen] =
    useState(false);
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

  // Table columns configuration - BỎ FILTER
  const columns = useMemo(
    () => [
      {
        title: t("boardingHouseName"),
        dataIndex: "boardingHouseName",
        key: "boardingHouseName",
      },
      {
        title: t("roomNumber"),
        dataIndex: "roomNumber",
        key: "roomNumber",
      },
      {
        title: t("endDate"),
        dataIndex: "endDate",
        key: "endDate",
      },
      {
        title: t("originalDepositAmount"),
        dataIndex: "originalDepositAmount",
        key: "originalDepositAmount",
        render: (price) => (
          <Tag color="processing">
            {price ? formatAmount(price, i18n.language) : "N/A"}
          </Tag>
        ),
      },
      {
        title: t("status"),
        dataIndex: "status",
        key: "status",
        render: (status) => {
          const statusLower = status?.toLowerCase() || "";
          let color;
          if (statusLower === "pending") color = "orange";
          else if (statusLower === "accepted") color = "green";
          else if (statusLower === "rejected") color = "red";
          else if (statusLower === "canceled") color = "volcano";
          else color = "default";

          const capitalize =
            status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

          return <Tag color={color}>{t(statusLower)}</Tag>;
        },
      },
      {
        title: t("reason"),
        dataIndex: "reason",
        key: "reason",
        ellipsis: true,
      },
      {
        title: t("createdAt"),
        dataIndex: "createdAt",
        key: "createdAt",
      },
      {
        title: t("actions"),
        key: "actions",
        render: (record) => {
          const isPending = record.status?.toLowerCase() === "pending";
          return isPending ? (
            <div className="flex gap-3 items-center">
              <Button
                title={t("reject")}
                iconPosition="left"
                btnReject
                onClick={() => handleReject(record)}
              />
              <Button
                title={t("accept")}
                iconPosition="left"
                btnAccept
                onClick={() => handleAccept(record)}
              />
            </div>
          ) : null;
        },
      },
    ],
    [t]
  );

  /**
   * Fetch refund requests data with pagination only
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const apiParams = {
        ...paginationOptions,
      };

      const response = await getRefundRequests(apiParams);

      // Xử lý response data
      if (response.data) {
        const responseData = response.data;

        // Kiểm tra structure của response
        if (responseData.success) {
          setRefundRequests(responseData.data || []);

          const newPagination = {
            currentPage: responseData.currentPage || 1,
            totalPages: responseData.totalPages || 1,
            totalItems: responseData.totalItems || 0,
            limit: paginationOptions.limit || responseData.limit || 10,
          };

          setPagination(newPagination);
        } else {
          // Nếu không có success flag, xử lý data trực tiếp
          setRefundRequests(Array.isArray(responseData) ? responseData : []);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: Array.isArray(responseData) ? responseData.length : 0,
            limit: paginationOptions.limit || 10, // Giữ limit từ paginationOptions
          });
        }
      }
    } catch (error) {
      // Xử lý các loại lỗi khác nhau
      let errorMessage = t("errorLoadingData");

      if (error.response) {
        // Lỗi từ server
        errorMessage =
          error.response.data?.message ||
          error.response.statusText ||
          errorMessage;
      } else if (error.request) {
        // Lỗi network
        errorMessage = t("networkError");
      } else {
        // Lỗi khác
        errorMessage = error.message || errorMessage;
      }

      toast.error(errorMessage);
      setRefundRequests([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 10,
      });
    } finally {
      setLoading(false);
    }
  }, [paginationOptions, t]);

  /**
   * Handle table change events - cách đơn giản nhất
   */
  const handleTableChange = useCallback(
    (tablePagination, filters, sorter) => {
      const newPaginationOptions = {
        page: tablePagination.current || 1,
        limit: tablePagination.pageSize || 10,
        sortField: paginationOptions.sortField,
        sortOrder: paginationOptions.sortOrder,
      };

      // Handle sorting
      if (sorter && sorter.field) {
        newPaginationOptions.sortField = sorter.field;
        newPaginationOptions.sortOrder =
          sorter.order === "descend" ? "desc" : "asc";
      }

      setPaginationOptions(newPaginationOptions);
    },
    [paginationOptions.sortField, paginationOptions.sortOrder]
  );

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle URL params on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");

    if (status === "success") {
      toast.success(t("paymentSuccessful") || "Payment successful!");
    } else if (status === "fail") {
      toast.error(t("paymentFailed") || "Payment failed!");
    }

    // Clean up URL params
    if (status) {
      params.delete("status");
      navigate(window.location.pathname, { replace: true });
    }
  }, [location, navigate, t]);

  // Clean up any pending requests when component unmounts
  useEffect(() => {
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.cancel("Component unmounted");
      }
    };
  }, []);

  // Action handlers
  const handleReject = useCallback((refundRequest) => {
    setSelectedRefundRequest(refundRequest);
    setIsRejectModalOpen(true);
  }, []);

  const handleAccept = useCallback((refundRequest) => {
    setSelectedRefundRequest(refundRequest);
    setIsDepositRefundPopupOpen(true);
  }, []);

  const handleRejectConfirm = useCallback(async () => {
    if (!reasonForCancel.trim()) {
      toast.error(
        t("pleaseProvideReason") ||
          "Please provide a reason for canceling the request."
      );
      return;
    }

    try {
      setLoading(true);

      // Gọi API để cancel refund request
      const response = await cancelRefundRequestsForOwner(
        selectedRefundRequest._id,
        reasonForCancel
      );

      // Xử lý response
      if (response.data) {
        const responseData = response.data;

        // Kiểm tra success
        if (responseData.success !== false) {
          toast.success(
            t("refundRequestCanceledSuccessfully") ||
              "Refund request canceled successfully!"
          );

          // Reset modal state
          setIsRejectModalOpen(false);
          setReasonForCancel("");
          setSelectedRefundRequest(null);

          // Refresh data
          fetchData();
        } else {
          throw new Error(
            responseData.message || "Failed to cancel refund request"
          );
        }
      } else {
        toast.success(
          t("refundRequestCanceledSuccessfully") ||
            "Refund request canceled successfully!"
        );

        // Reset modal state
        setIsRejectModalOpen(false);
        setReasonForCancel("");
        setSelectedRefundRequest(null);

        // Refresh data
        fetchData();
      }
    } catch (error) {
      console.error("Error canceling refund request:", error);

      // Xử lý lỗi
      let errorMessage =
        t("errorCancelingRefundRequest") ||
        "Error canceling the refund request.";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          error.response.statusText ||
          errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedRefundRequest, reasonForCancel, fetchData, t]);

  const handleCancelRejectModal = useCallback(() => {
    setIsRejectModalOpen(false);
    setReasonForCancel("");
    setSelectedRefundRequest(null);
  }, []);

  // Đảm bảo tablePaginationConfig đúng
  const tablePaginationConfig = useMemo(
    () => ({
      current: pagination.currentPage,
      pageSize: pagination.limit,
      total: pagination.totalItems,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ["10", "20", "50", "100"],
      showTotal: (total, range) => (
        <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
          {t("showingRecords", {
            start: range[0],
            end: range[1],
            total,
          }) || `Showing ${range[0]} to ${range[1]} of ${total} records`}
        </span>
      ),
      // Thêm các props này để đảm bảo hoạt động đúng
      hideOnSinglePage: false,
      responsive: true,
    }),
    [pagination, t, darkMode]
  );

  return (
    <div className="container mx-auto py-8 px-4">
      {loading ? (
        <Loader />
      ) : (
        <>
          <Table
            tableName={t("depositRefundRequests") || "Deposit Refund Requests"}
            columns={columns}
            data={refundRequests}
            loading={loading}
            onChange={handleTableChange}
            pagination={tablePaginationConfig}
            emptyText={t("noRefundRequestsFound") || "No refund requests found"}
          />

          {/* Reject Modal */}
          <Modal
            title={t("rejectRefundRequest") || "Reject Refund Request"}
            open={isRejectModalOpen}
            onOk={handleRejectConfirm}
            onCancel={handleCancelRejectModal}
            okText={t("reject") || "Reject"}
            cancelText={t("cancel") || "Cancel"}
            width="400px"
            confirmLoading={loading}
          >
            <Form layout="vertical">
              <Form.Item
                label={t("reasonForCancel") || "Reason For Cancel"}
                name="reasonForCancel"
                rules={[
                  {
                    required: true,
                    message:
                      t("pleaseEnterReason") ||
                      "Please enter a reason for rejection",
                  },
                ]}
              >
                <Input.TextArea
                  placeholder={
                    t("enterReasonForRejection") || "Enter reason for rejection"
                  }
                  value={reasonForCancel}
                  onChange={(e) => setReasonForCancel(e.target.value)}
                  style={{ width: "100%", height: "100px" }}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Form>
          </Modal>

          {/* Deposit Refund Popup */}
          <DepositRefundPopup
            visible={isDepositRefundPopupOpen}
            setVisible={setIsDepositRefundPopupOpen}
            depositRefundData={selectedRefundRequest}
            onSuccess={fetchData}
          />
        </>
      )}
    </div>
  );
}

export default DepositRefundRequestOwner;
