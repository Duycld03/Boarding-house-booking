import { Modal } from "antd";
import ButtonCustom from "../Button";
import { useTheme } from "@/context/ThemeContext";
import "./ConfirmModal.css"; // Import CSS for the close button styling

const ConfirmModal = ({
  title,
  content,
  onOk,
  onCancel,
  isOpen,
  confirmLoading,
}) => {
  const { darkMode } = useTheme();

  // Modal styles based on theme
  const modalStyles = {
    content: {
      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
      boxShadow: darkMode
        ? "0 8px 16px rgba(0, 0, 0, 0.4)"
        : "0 8px 16px rgba(0, 0, 0, 0.1)",
    },
    header: {
      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
      borderBottom: darkMode ? "1px solid #374151" : "1px solid #f0f0f0",
      color: darkMode ? "#e5e7eb" : "#374151",
    },
    body: {
      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
      color: darkMode ? "#e5e7eb" : "#374151",
    },
    mask: {
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.45)",
    },
    closeIcon: {
      color: darkMode ? "#e5e7eb" : "#444",
    },
  };

  // Enhanced title with dark mode support
  const enhancedTitle = darkMode ? (
    <span className="text-gray-100">{title}</span>
  ) : (
    <span className="text-gray-800">{title}</span>
  );

  // Enhanced content with dark mode support
  const enhancedContent = darkMode ? (
    <div className="text-gray-200">{content}</div>
  ) : (
    <div className="text-gray-700">{content}</div>
  );

  return (
    <Modal
      title={enhancedTitle}
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      confirmLoading={confirmLoading}
      className={darkMode ? "dark-modal" : ""}
      styles={modalStyles}
      closeIcon={
        darkMode ? <span className="dark-close-icon">×</span> : undefined
      }
    >
      {enhancedContent}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "flex-end",
          gap: 20,
        }}
      >
        <ButtonCustom
          size="large"
          title="Confirm"
          onClick={onOk}
          className={
            darkMode
              ? "bg-teal-500 text-white hover:bg-teal-400"
              : "bg-teal-600 text-white hover:bg-teal-700"
          }
          loading={confirmLoading}
        />
        <ButtonCustom
          title="Cancel"
          onClick={onCancel}
          size="large"
          btnCancel
        />
      </div>
    </Modal>
  );
};

export default ConfirmModal;
