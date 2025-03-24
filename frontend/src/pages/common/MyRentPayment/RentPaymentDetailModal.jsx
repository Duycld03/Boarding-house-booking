import { Modal, Descriptions, Tag } from "antd";
import {
  HomeOutlined,
  DollarCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  ThunderboltOutlined,
  FireOutlined,
  ShopOutlined,
} from "@ant-design/icons";

const RentPaymentDetailModal = ({ payment, onClose }) => {
  if (!payment) return null;

  const statusColors = {
    paid: "green",
    pending: "orange",
    overdue: "red",
  };

  const formattedDate = new Date(payment.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  return (
    <Modal
      title="Payment Details"
      open={!!payment}
      onCancel={onClose}
      footer={null}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item
          label={
            <>
              <ShopOutlined /> Rental House
            </>
          }
        >
          {payment.paymentBillId?.roomId?.boardingHouseId?.name || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <>
              <HomeOutlined /> Room Number
            </>
          }
        >
          {payment.paymentBillId?.roomId?.roomNumber || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <>
              <DollarCircleOutlined /> Total Payment
            </>
          }
        >
          <b style={{ color: "orange" }}>
            {payment.paymentBillId?.paymentAmount?.toLocaleString()} VND
          </b>
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <>
              <CheckCircleOutlined /> Status
            </>
          }
        >
          <Tag color={statusColors[payment.status] || "blue"}>
            {payment.status.toUpperCase()}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <>
              <CalendarOutlined /> Rent for Month
            </>
          }
        >
          {formattedDate}
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <>
              <ThunderboltOutlined /> Electricity Bill
            </>
          }
        >
          <div>
            Old Reading: {payment.paymentBillId?.electricalBill?.oldNumber || 0}{" "}
            kWh
          </div>
          <div>
            New Reading: {payment.paymentBillId?.electricalBill?.newNumber || 0}{" "}
            kWh
          </div>
          <div>
            Consumption:{" "}
            {payment.paymentBillId?.electricalBill?.quantityConsumed || 0} kWh
          </div>
          <div>
            Total Amount:{" "}
            <b style={{ color: "orange" }}>
              {payment.paymentBillId?.electricalBill?.totalAmount?.toLocaleString()}{" "}
              VND
            </b>
          </div>
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <>
              <FireOutlined /> Water Bill
            </>
          }
        >
          <div>
            Old Reading: {payment.paymentBillId?.waterBill?.oldNumber || 0} m³
          </div>
          <div>
            New Reading: {payment.paymentBillId?.waterBill?.newNumber || 0} m³
          </div>
          <div>
            Consumption:{" "}
            {payment.paymentBillId?.waterBill?.quantityConsumed || 0} m³
          </div>
          <div>
            Total Amount:{" "}
            <b style={{ color: "orange" }}>
              {payment.paymentBillId?.waterBill?.totalAmount?.toLocaleString()}{" "}
              VND
            </b>
          </div>
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <>
              <CreditCardOutlined /> Total Amount Due
            </>
          }
        >
          <b style={{ color: "orange", fontSize: "16px" }}>
            {payment?.paymentAmount?.toLocaleString()} VND
          </b>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default RentPaymentDetailModal;
