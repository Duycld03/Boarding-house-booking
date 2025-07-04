import React, { useEffect, useState } from "react";
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

const RentPaymentManagement = () => {
  const { t, i18n } = useTranslation("rentPayment"); // Get current language from i18n
  const { formatPrice } = useFormatAmount(i18n.language); // Use current language for formatting
  const { boardingHouseId } = useParams();
  const [rentPaymentData, setRentPaymentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedPaymentBill, setSelectedPaymentBill] = useState(null);

  const fetchPaymentBillDetails = async () => {
    if (!boardingHouseId) return;
    setLoading(true);
    try {
      const res = await getPaymentBillByBoardingHouseId(boardingHouseId);
      const updatedData = res.map((bill) => ({
        ...bill,
        _id: bill._id,
      }));
      setRentPaymentData(updatedData);
    } catch (error) {
      console.log(error);
      setRentPaymentData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentBillDetails();
  }, [boardingHouseId]);

  // Re-render when language changes to update currency formatting
  useEffect(() => {
    // No need to refetch data, just force a re-render to update currency format
  }, [i18n.language]);

  const columns = [
    {
      title: t("roomNumber"),
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: t("monthlyRent"),
      dataIndex: "rentMonth",
      key: "rentMonth",
    },
    {
      title: t("status"),
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusLower = status?.toLowerCase() || "";
        let color;
        if (statusLower === "pending") color = "orange";
        else if (statusLower === "paid") color = "green";
        else if (statusLower === "deleted") color = "volcano";
        else color = "red";

        let translatedStatus;
        if (statusLower === "pending") translatedStatus = t("pending");
        else if (statusLower === "paid") translatedStatus = t("paid");
        else if (statusLower === "deleted") translatedStatus = t("deleted");
        else translatedStatus = t("unknown");

        return <Tag color={color}>{translatedStatus}</Tag>;
      },
    },
    {
      title: t("additionalFee"),
      dataIndex: "additionalFee",
      key: "additionalFee",
      render: (price) => price ? formatPrice(price) : formatPrice(0),
    },
    {
      title: t("electricalBill"),
      dataIndex: "electricalBill",
      key: "electricalBill",
      render: (price) => {
        // If price is an object with totalAmount, use that
        if (price && typeof price === 'object' && price.totalAmount) {
          return formatPrice(price.totalAmount);
        }
        // If price is a number, use it directly
        else if (typeof price === 'number') {
          return formatPrice(price);
        }
        // Otherwise, show not applicable
        return t("notApplicable");
      },
    },
    {
      title: t("waterBill"),
      dataIndex: "waterBill",
      key: "waterBill",
      render: (price) => {
        // If price is an object with totalAmount, use that
        if (price && typeof price === 'object' && price.totalAmount) {
          return formatPrice(price.totalAmount);
        }
        // If price is a number, use it directly
        else if (typeof price === 'number') {
          return formatPrice(price);
        }
        // Otherwise, show not applicable
        return t("notApplicable");
      },
    },
    {
      title: t("paymentAmount"),
      dataIndex: "paymentAmount",
      key: "paymentAmount",
      render: (price) => price ? formatPrice(price) : t("notApplicable"),
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
  ];

  const handleOpenUpdateModal = (record) => {
    if (!record._id) {
      toast.error(t("missingPaymentId"));
      return;
    }
    setSelectedPaymentBill(record);
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <Button
          btnAdd
          title={t("calculateMonthly")}
          size="large"
          onClick={() => {
            setIsOpen(true);
          }}
        />
      </div>

      <Table
        columns={columns}
        data={rentPaymentData?.length > 0 ? rentPaymentData : []}
        loading={loading}
        emptyText={t("noRentData")}
      />
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
