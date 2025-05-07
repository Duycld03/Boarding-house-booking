import React, { useState, useEffect } from "react";
import { TableCustom as Table, Button } from "@/component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import convertTimetap from "@/utils/convertTimetap";
import {
  getRenewalRequestByBhID,
  acceptExtensionRequest,
  rejectExtensionRequest, // New function for reject
} from "@/api/renewalRequestManagement";
import { Tag, Input, Modal } from "antd";
import { toast } from "react-toastify";
import ConfirmModal from "@/component/ConfirmModal";
import { Form } from "antd"; // Import Form component

const RenewalRequest = ({ boardingHouseId }) => {
  // Status colors
  const statusColors = {
    pending: "orange",
    accepted: "green",
    rejected: "red",
  };

  // State for storing requests, modal and rejection reason
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reasonForCancel, setReasonForCancel] = useState(""); // State for rejection reason
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false); // State for reject modal

  // Fetch renewal requests when component mounts
  const fetchRequests = async () => {
    try {
      const response = await getRenewalRequestByBhID(boardingHouseId);
      console.log("API Response:", response);

      if (response?.data?.length > 0) {
        setRequests(response.data);
      } else {
        setRequests([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch renewal requests:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [boardingHouseId]);

  // Handle Reject action
  const handleReject = (record) => {
    setSelectedRequest(record); // Set the selected request
    setIsRejectModalOpen(true); // Open the reject modal
  };

  // Handle Reject confirmation (send to backend)
  const handleRejectConfirm = async () => {
    try {
      if (!reasonForCancel) {
        toast.error("Please provide a reason for rejecting.");
        return;
      }

      // Make the API call to reject the extension request
      await rejectExtensionRequest(selectedRequest?.requestId, reasonForCancel);
      toast.success("Request rejected successfully.");
      setIsRejectModalOpen(false); // Close the modal
      fetchRequests(); // Re-fetch the data after rejection
    } catch (error) {
      console.error("Error rejecting renewal request:", error);
      toast.error("An error occurred while rejecting the renewal request.");
    }
  };

  // Handle Accept action
  const handleAccept = (record) => {
    setSelectedRequest(record); // Ensure selectedRequest includes requestId
    setIsModalOpen(true); // Open the confirmation modal for accept
  };

  // Confirm accept action from modal
  const handleConfirmAccept = async () => {
    try {
      if (!selectedRequest?.requestId) {
        console.error("Request ID is missing");
        return;
      }

      // Make the API call to accept the extension request
      await acceptExtensionRequest(selectedRequest?.requestId);
      toast.success("Accepted renewal request successfully.");
      setIsModalOpen(false);
      fetchRequests();
    } catch (error) {
      console.error("Error accepting renewal request:", error);
      toast.error("An error occurred while accepting the renewal request.");
    }
  };

  // Cancel modal
  const handleCancelModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null); // Reset the selected request
  };

  // Cancel Reject modal
  const handleCancelRejectModal = () => {
    setIsRejectModalOpen(false);
    setReasonForCancel(""); // Reset reason for cancel
  };

  const columns = [
    {
      title: "Tenant Name",
      dataIndex: "tenantName",
      key: "tenantName",
    },
    {
      title: "Room Number",
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: "Boarding House",
      dataIndex: "boardingHouseName",
      key: "boardingHouseName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: "Current End Date",
      dataIndex: "currentEndDate",
      key: "currentEndDate",
      render: (text) => convertTimetap(text, false),
    },
    {
      title: "Requested End Date",
      dataIndex: "requestedEndDate",
      key: "requestedEndDate",
      render: (text) => convertTimetap(text, false),
    },
    {
      title: "Action",
      render: (record) =>
        record.status === "pending" && (
          <div className="flex gap-3 items-center">
            <Button
              title={"Reject"}
              iconPosition="left"
              btnReject
              size="large"
              style={{ backgroundColor: "red", color: "white", border: "none" }}
              onClick={() => handleReject(record)} // Open reject modal
            ></Button>

            <Button
              title={"Accept"}
              size="large"
              btnAccept
              className="text-white"
              bgColor="rgb(5 150 105)"
              onClick={() => handleAccept(record)} // Trigger accept action
            ></Button>
          </div>
        ),
    },
  ];

  return (
    <div>
      <Table data={requests} columns={columns} loading={loading} />

      {/* Confirmation Modal for Accept */}
      <ConfirmModal
        title="Confirm Acceptance"
        content={`Are you sure you want to accept the renewal request for room ${selectedRequest?.roomNumber}?`}
        onOk={handleConfirmAccept}
        onCancel={handleCancelModal}
        isOpen={isModalOpen}
      />

      {/* Reject Modal with input field for reason */}
      <Modal
        title="Reject Renewal Request"
        visible={isRejectModalOpen}
        onOk={handleRejectConfirm}
        onCancel={handleCancelRejectModal}
        okText="Reject"
        width="400px"
      >
        <Form layout="vertical">
          <Form.Item
            label="Reason For Cancel"
            name="reasonForCancel"
            rules={[
              {
                required: true,
                message: "Please enter a reason for rejection",
              },
            ]} // Optional validation
          >
            <Input.TextArea
              type="text"
              placeholder="Enter reason for rejection"
              value={reasonForCancel}
              onChange={(e) => setReasonForCancel(e.target.value)}
              style={{ width: "100%", height: "100px" }} // Ensure the input field takes up the full width inside the modal
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RenewalRequest;
