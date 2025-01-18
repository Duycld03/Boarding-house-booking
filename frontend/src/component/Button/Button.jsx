import { Button } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  UndoOutlined,
  PlusOutlined,
  RestOutlined,
} from "@ant-design/icons";

const ButtonCustom = ({
  title,
  size = "medium", // small, medium, large
  btnDelete = false,
  btnUpdate = false,
  btnRestore = false,
  btnTrash = false,
  btnAdd = false,
  width = "auto",
  height = "auto",
  onClick,
  icon,
  iconPosition = "left",
  className,
  style,
  bgColor,
  txtColor,
  disabled,
  ...props
}) => {
  const presetIcon = btnDelete ? (
    <DeleteOutlined />
  ) : btnUpdate ? (
    <EditOutlined />
  ) : btnRestore ? (
    <UndoOutlined />
  ) : btnTrash ? (
    <RestOutlined />
  ) : btnAdd ? (
    <PlusOutlined />
  ) : null;

  // Tailwind classes for button background
  const backgroundClass = btnDelete
    ? "bg-red-500 hover:bg-red-600 text-white"
    : btnUpdate
    ? "bg-blue-500 hover:bg-blue-600 text-white"
    : btnRestore
    ? "bg-green-500 hover:bg-green-600 text-white"
    : btnTrash
    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
    : btnAdd
    ? "bg-primary hover:bg-purple-600 text-white"
    : "bg-gray-200 hover:bg-gray-300";

  const customStyle = {
    width: width !== "auto" ? width : undefined,
    height: height !== "auto" ? height : undefined,
    ...style,
  };

  return (
    <div>
      <Button
        onClick={onClick}
        className={`${backgroundClass} rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={{
          ...customStyle,
          backgroundColor: bgColor,
          color: txtColor,
        }}
        size={size}
        disabled={disabled}
        {...props}
      >
        {iconPosition === "left" && (presetIcon || icon)}
        {title}
        {iconPosition === "right" && (presetIcon || icon)}
      </Button>
    </div>
  );
};

export default ButtonCustom;
