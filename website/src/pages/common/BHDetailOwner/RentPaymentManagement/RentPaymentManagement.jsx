import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TableCustom as Table, Button, ConfirmModal } from "@/component";
import { toast } from "react-toastify";
import convertTimetap from "@/utils/convertTimetap";
import { Tag } from "antd";
import formatAmount from "@/utils/formatAmount";
import CalculateRent from "./CalculateRent";
import { getPaymentBillByBoardingHouseId } from "@/api/ownerUser/paymentBillAPI";
import { useTranslation } from "react-i18next";

const RentPaymentManagement = () => {
  const { t } = useTranslation("rentPayment"); // Initialize translation namespace
  const { boardingHouseId } = useParams();
  const [rentPaymentData, setRentPaymentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchRentPaymentData = async () => {
    if (!boardingHouseId) return;
    setLoading(true);
    try {
      const res = await getPaymentBillByBoardingHouseId(boardingHouseId);
      setRentPaymentData(res);
    } catch (error) {
      console.log(error);
      setRentPaymentData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentPaymentData();
  }, [boardingHouseId]);

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

        // Determine color based on case-insensitive comparison
        let color;
        if (statusLower === "pending") {
          color = "orange";
        } else if (statusLower === "paid") {
          color = "green";
        } else if (statusLower === "deleted") {
          color = "volcano";
        } else {
          color = "red";
        }

        // Translate the status
        let translatedStatus;
        if (statusLower === "pending") {
          translatedStatus = t("pending");
        } else if (statusLower === "paid") {
          translatedStatus = t("paid");
        } else if (statusLower === "deleted") {
          translatedStatus = t("deleted");
        } else {
          translatedStatus = t("unknown");
        }

        return <Tag color={color}>{translatedStatus}</Tag>;
      },
    },
    {
      title: t("additionalFee"),
      dataIndex: "additionalFee",
      key: "additionalFee",
      render: (price) => (price ? formatAmount(price) : 0),
    },
    {
      title: t("electricalBill"),
      dataIndex: "electricalBill",
      key: "electricalBill",
      render: (price) => (price ? formatAmount(price) : t("notApplicable")),
    },
    {
      title: t("waterBill"),
      dataIndex: "waterBill",
      key: "waterBill",
      render: (price) => (price ? formatAmount(price) : t("notApplicable")),
    },
    {
      title: t("paymentAmount"),
      dataIndex: "paymentAmount",
      key: "paymentAmount",
      render: (price) => (price ? formatAmount(price) : t("notApplicable")),
    },
  ];

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
        fetchRentPaymentData={fetchRentPaymentData}
      />
    </div>
  );
};

export default RentPaymentManagement;
