import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  Form,
  Input,
  Upload,
  Select,
  Card,
  Space,
  Row,
  Col,
  Typography,
  DatePicker,
} from "antd";
import { CameraOutlined, DollarCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getRoomTypeByBhId,
  updateRoom,
} from "@/api/ownerUser/boardingHouseAPI";
import {
  getRoomAdditionFeesByRoomId,
  createRoomAdditionFee,
  deleteRoomAdditionFee,
  updateRoomAdditionFee,
} from "@/api/roomAdditionFee";

import { Button, ConfirmModal, TableCustom as Table } from "@/component";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import dayjs from "dayjs";
import "./updateRoom.css"; // Import custom styles if needed

const { Title, Text } = Typography;

function UpdateRoomPage({
  boardingHouseId,
  refreshRoomData,
  roomData,
  onBack,
  onUpdate,
  onDelete,
}) {
  const [form] = Form.useForm();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const { t } = useTranslation("bhManagement");
  const { darkMode } = useTheme();
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  // ============ IMPROVED PAGINATION STATES ============
  // Tách biệt state pagination và options như component RoomManagement
  const [feesData, setFeesData] = useState([]);
  const [loadingFees, setLoadingFees] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  // State hiển thị thông tin pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  // State điều khiển pagination options
  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
  });

  // Ref để handle cancel requests
  const currentFeeRequestRef = useRef(null);

  // ============ IMPROVED PAGINATION CONFIG ============
  const tablePaginationConfig = useMemo(
    () => ({
      current: pagination.currentPage,
      pageSize: pagination.limit,
      total: pagination.totalItems,
      showSizeChanger: true,
      showQuickJumper: true,
    }),
    [pagination, t]
  );

  const fetchRoomFees = useCallback(async () => {
    if (!roomData?._id) return;

    try {
      setLoadingFees(true);

      // Cancel previous request if exists
      if (currentFeeRequestRef.current) {
        // currentFeeRequestRef.current.cancel("New request initiated");
      }

      const monthValue = selectedMonth.month() + 1; // dayjs month is 0-indexed
      const yearValue = selectedMonth.year();

      // Create AbortController for request cancellation
      const controller = new AbortController();
      currentFeeRequestRef.current = controller;

      const response = await getRoomAdditionFeesByRoomId(
        roomData._id,
        paginationOptions,
        monthValue,
        yearValue,
        { signal: controller.signal } // Pass abort signal if API supports it
      );

      // Handle different response structures
      if (response?.data) {
        const responseData = response.data;

        // Set fees data
        if (Array.isArray(responseData)) {
          setFeesData(responseData);
        } else if (responseData.data && Array.isArray(responseData.data)) {
          setFeesData(responseData.data);
        } else {
          setFeesData([]);
        }

        // Handle pagination info
        if (responseData.pagination) {
          const paginationInfo = responseData.pagination;

          // Kiểm tra nếu currentPage > totalPages thì reset về trang 1
          if (
            paginationInfo.currentPage > paginationInfo.totalPages &&
            paginationInfo.totalPages > 0
          ) {
            setPaginationOptions((prev) => ({ ...prev, page: 1 }));
            return; // Will trigger re-fetch with page 1
          }

          setPagination({
            currentPage: paginationInfo.currentPage || paginationOptions.page,
            totalPages: paginationInfo.totalPages || 1,
            totalItems: paginationInfo.totalItems || 0,
            limit: paginationInfo.limit || paginationOptions.limit,
          });
        } else if (response.currentPage !== undefined) {
          // Alternative response structure
          setPagination({
            currentPage: response.currentPage || paginationOptions.page,
            totalPages: response.totalPages || 1,
            totalItems: response.totalItems || 0,
            limit: response.limit || paginationOptions.limit,
          });
        } else {
          // Fallback for simple array response
          setPagination((prev) => ({
            ...prev,
            currentPage: paginationOptions.page,
            totalItems: Array.isArray(responseData) ? responseData.length : 0,
            totalPages: 1,
          }));
        }
      } else {
        // Empty or invalid response
        setFeesData([]);
        setPagination((prev) => ({
          ...prev,
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
        }));
      }
    } catch (error) {
      console.error("Error fetching room fees:", error);

      if (error.name !== "AbortError" && error.name !== "CanceledError") {
        // Handle different error types
        if (error.response?.status === 404) {
          // No fees found - this is normal
          setFeesData([]);
          setPagination((prev) => ({
            ...prev,
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
          }));
        } else if (error.response?.status >= 500) {
          // Server error - reset pagination
          toast.error(t("roomAdditionFee.messages.error.fetchFees"));
          setFeesData([]);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            limit: paginationOptions.limit,
          });
          setPaginationOptions((prev) => ({ ...prev, page: 1 }));
        } else {
          // Other errors - keep pagination state
          toast.error(
            error.response?.data?.message ||
              t("roomAdditionFee.messages.error.fetchFees")
          );
          setFeesData([]);
        }
      }
    } finally {
      setLoadingFees(false);
      currentFeeRequestRef.current = null;
    }
  }, [roomData?._id, paginationOptions, selectedMonth, t]);

  // ============ IMPROVED TABLE CHANGE HANDLER ============
  const handleTableChange = useCallback(
    (newPagination, filters, sorter) => {
      console.log("Fees table change:", { newPagination, filters, sorter });

      // Validation input
      const page = Math.max(1, newPagination.current || 1);
      const limit = Math.min(100, Math.max(5, newPagination.pageSize || 10));

      const newOptions = {
        ...paginationOptions,
        page,
        limit,
      };

      // Xử lý sorting
      const { field, order } = sorter || {};
      if (field && order) {
        newOptions.sortField = field;
        newOptions.sortOrder = order === "ascend" ? "asc" : "desc";
      } else if (sorter === null || (sorter && !field)) {
        // Reset to default sort
        newOptions.sortField = "createdAt";
        newOptions.sortOrder = "desc";
      }

      // Xử lý filtering (nếu cần)
      if (filters && Object.keys(filters).length > 0) {
        newOptions.filters = Object.entries(filters)
          .filter(([_, value]) => value && value.length > 0)
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});
      } else {
        delete newOptions.filters;
      }

      setPaginationOptions(newOptions);
    },
    [paginationOptions]
  );

  // ============ IMPROVED MONTH CHANGE HANDLER ============
  const handleMonthChange = useCallback((date) => {
    if (!date) return;

    setSelectedMonth(date);
    // Reset pagination khi thay đổi tháng
    setPaginationOptions((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  // ============ IMPROVED EFFECTS ============
  // Effect để fetch phí khi dependencies thay đổi
  useEffect(() => {
    if (roomData?._id) {
      fetchRoomFees();
    }
  }, [fetchRoomFees]);

  // Clean up requests khi component unmount
  useEffect(() => {
    return () => {
      if (currentFeeRequestRef.current) {
        // currentFeeRequestRef.current.cancel("Component unmounted");
      }
    };
  }, []);

  const refreshFeesData = useCallback(() => {
    setPaginationOptions((prev) => ({ ...prev, page: 1 }));
    fetchRoomFees();
  }, [fetchRoomFees]);

  // Columns cho bảng phí - Updated with sorting
  const feesColumns = useMemo(
    () => [
      {
        title: t("roomAdditionFee.form.feeName"),
        dataIndex: "feeName",
        key: "feeName",
        render: (text) => (
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {text || t("roomAdditionFee.table.unknownFee")}
          </span>
        ),
      },
      {
        title: t("roomAdditionFee.form.feeAmount"),
        dataIndex: "feeAmount",
        key: "feeAmount",
        render: (amount) => (
          <span className="font-semibold text-green-600 dark:text-green-400">
            {amount
              ? new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(amount)
              : "-"}
          </span>
        ),
      },
      {
        title: t("roomAdditionFee.table.columns.createdAt"),
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date) => (
          <span className="text-gray-600 dark:text-gray-300">
            {date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"}
          </span>
        ),
      },
    ],
    [t]
  );

  // ============ EXISTING FUNCTIONS (unchanged) ============
  const onFinish = async (values) => {
    if (fileList.length === 0) {
      toast.error(t("roomManagement.updateRoom.pleaseUploadImage"));
      return;
    }

    setLoadingSubmit(true);
    const formData = new FormData();
    formData.append("roomNumber", values.roomNumber);
    formData.append("boardingHouseId", boardingHouseId);
    formData.append("description", values.description);
    formData.append("roomTypeId", values.roomType);
    formData.append("Room", fileList[0].originFileObj);

    try {
      const res = await updateRoom(roomData._id, formData);
      refreshRoomData();
      toast.success(res.message);
      if (onBack) {
        onBack();
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const onCancel = () => {
    form.resetFields();
    setFileList([]);
    if (onBack) {
      onBack();
    }
  };

  const handleChange = ({ fileList }) => {
    setFileList(fileList.slice(-1));
  };

  const fetchRoomTypes = async () => {
    try {
      const res = await getRoomTypeByBhId(boardingHouseId);
      setRoomTypes(res.data);
      if (res.data.length === 0) {
        toast.error(t("roomManagement.updateRoom.noRoomTypeFound"));
        if (onBack) {
          onBack();
        }
      }
    } catch (error) {
      toast.error(t("roomManagement.updateRoom.errorFetchingRoomTypes"));
      console.log(error);
    }
  };

  const loadRoomImage = async () => {
    try {
      const res = await fetch(roomData.images.imageUrl);
      const blob = await res.blob();
      const file = new File([blob], "room_image.jpg", { type: blob.type });

      setFileList([
        {
          uid: "-1",
          name: "room_image.jpg",
          status: "done",
          url: roomData.images.imageUrl,
          originFileObj: file,
        },
      ]);
    } catch (err) {
      console.error("Error loading image:", err);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
    if (roomData && roomData.images) {
      loadRoomImage();
    }
  }, []);

  const getContentBgClasses = () => {
    return darkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200";
  };

  const getTextColor = () => {
    return darkMode ? "text-gray-200" : "text-gray-800";
  };

  const getImageContainerClasses = () => {
    return darkMode
      ? "bg-gradient-to-br from-gray-700 to-gray-600 border-gray-600"
      : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300";
  };

  const handleToggleConfirmDelete = () => {
    setIsOpenDeleteModal(!isOpenDeleteModal);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 p-6">
      <div className="w-full h-full">
        {/* Header với nút back */}
        <div className="mb-6">
          <Button
            onClick={onCancel}
            title={t("roomManagement.updateRoom.backToRoomManagement")}
            size="large"
            btnBack
          />
        </div>

        <Row gutter={[20, 20]} align="stretch">
          {/* Left Column - Image */}
          <Col xs={24} lg={10}>
            <div
              className={`${getImageContainerClasses()} rounded-xl h-[435px] flex items-center justify-center relative overflow-hidden border-2 border-dashed transition-all duration-300`}
            >
              {fileList.length > 0 ? (
                <img
                  src={
                    fileList[0].url ||
                    URL.createObjectURL(fileList[0].originFileObj)
                  }
                  alt="Room"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <CameraOutlined
                    className={`text-7xl mb-6 ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                  <Text
                    className={`${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    } font-medium text-center`}
                  >
                    {t("roomManagement.updateRoom.clickToUploadImage")}
                  </Text>
                  <Text
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    } text-base mt-3 text-center`}
                  >
                    {t("roomManagement.updateRoom.imageFileFormat")}
                  </Text>
                </div>
              )}

              {/* Upload overlay */}
              <Upload
                fileList={[]}
                maxCount={1}
                accept="image/*"
                beforeUpload={() => false}
                onChange={handleChange}
                showUploadList={false}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-lg">
                  <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                    <CameraOutlined className="text-3xl text-blue-600" />
                  </div>
                </div>
              </Upload>
            </div>
          </Col>

          {/* Right Column - Form */}
          <Col xs={24} lg={14}>
            <Form
              layout="vertical"
              form={form}
              onFinish={onFinish}
              initialValues={
                roomData && {
                  roomType: roomData.roomTypeId._id,
                  roomNumber: roomData.roomNumber,
                  description: roomData.description,
                }
              }
            >
              <Space direction="vertical" size="large" className="w-full">
                <Form.Item
                  label={
                    <Text strong className={`${getTextColor()}`}>
                      {t("roomManagement.updateRoom.roomType")}
                    </Text>
                  }
                  name="roomType"
                  rules={[
                    {
                      required: true,
                      message: t(
                        "roomManagement.updateRoom.pleaseSelectRoomType"
                      ),
                    },
                  ]}
                >
                  <Select
                    size="large"
                    placeholder={t("roomManagement.updateRoom.selectRoomType")}
                    className={`rounded-lg h-16  ${
                      darkMode
                        ? "[&_.ant-select-selector]:bg-gray-700 [&_.ant-select-selector]:border-gray-600 [&_.ant-select-selector]:text-gray-200"
                        : ""
                    }`}
                  >
                    {roomTypes.map((roomType) => (
                      <Select.Option key={roomType._id} value={roomType._id}>
                        <span className="">{roomType.typeName}</span>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={
                    <Text strong className={`${getTextColor()}`}>
                      {t("roomManagement.updateRoom.roomNumber")}
                    </Text>
                  }
                  name="roomNumber"
                  rules={[
                    {
                      required: true,
                      message: t(
                        "roomManagement.updateRoom.pleaseEnterRoomNumber"
                      ),
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder={t("roomManagement.updateRoom.enterRoomNumber")}
                    className={`rounded-lg h-16  ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                        : ""
                    }`}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <Text strong className={`${getTextColor()}`}>
                      {t("roomManagement.updateRoom.description")}
                    </Text>
                  }
                  name="description"
                  rules={[
                    {
                      required: true,
                      message: t(
                        "roomManagement.updateRoom.pleaseEnterRoomDescription"
                      ),
                    },
                  ]}
                >
                  <Input.TextArea
                    size="large"
                    placeholder={t(
                      "roomManagement.updateRoom.enterDetailedRoomDescription"
                    )}
                    autoSize={{ minRows: 6, maxRows: 8 }}
                    className={`rounded-lg  p-4 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                        : ""
                    }`}
                  />
                </Form.Item>
              </Space>
            </Form>
          </Col>

          {/* Action Buttons */}
          <Col xs={24} sm={12}>
            <Button
              btnDelete
              title={t("roomManagement.updateRoom.deleteRoom")}
              size="large"
              className="w-full"
              onClick={handleToggleConfirmDelete}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Button
              btnUpdate
              title={t("roomManagement.updateRoom.updateRoom")}
              size="large"
              loading={loadingSubmit}
              onClick={() => form.submit()}
              className="w-full"
            />
          </Col>

          {/* IMPROVED Fees Table Section */}
          <Col xs={24}>
            <Card
              className={`${getContentBgClasses()} border-2 shadow-lg rounded-xl mt-6`}
              title={
                <Title level={4} className={"text-gray-800 dark:text-white"}>
                  {t("roomAdditionFee.title")}
                </Title>
              }
              extra={
                <div className="flex items-center gap-3">
                  <Text className={`${getTextColor()}`}>
                    {t("roomAdditionFee.form.month")}:
                  </Text>
                  <DatePicker
                    picker="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    format="MM/YYYY"
                    placeholder={t("roomAdditionFee.placeholder.selectMonth")}
                    className={
                      darkMode
                        ? "[&_.ant-picker-input>input]:bg-gray-700 [&_.ant-picker-input>input]:border-gray-600 [&_.ant-picker-input>input]:text-gray-200"
                        : ""
                    }
                  />
                </div>
              }
            >
              <Table
                columns={feesColumns}
                data={feesData}
                loading={loadingFees}
                pagination={tablePaginationConfig}
                onChange={handleTableChange}
                tableName={t("roomAdditionFee.feeList")}
                scroll={{ x: 600 }} // Add scroll for responsive
              />
            </Card>
          </Col>
        </Row>
      </div>

      <ConfirmModal
        title={t("roomAdditionFee.modal.deleteFee.title")}
        content={t("roomAdditionFee.messages.warning.deleteConfirmation")}
        onOk={() => {
          onDelete(roomData._id);
          setIsOpenDeleteModal(false);
        }}
        onCancel={() => {
          setIsOpenDeleteModal(false);
        }}
        isOpen={isOpenDeleteModal}
      />
    </div>
  );
}

export default UpdateRoomPage;
