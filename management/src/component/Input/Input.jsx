import { Input as AntdInput } from "antd";

const CustomInput = ({
  type = "text",
  placeholder,
  value,
  onChange,
  errorMessage,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col">
      <AntdInput
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`border border-gray-300 p-2 rounded focus:ring-1 focus:ring-primary ${className}`}
        {...props}
      />
      {errorMessage && (
        <span className="text-red-500 text-sm mt-1">{errorMessage}</span>
      )}
    </div>
  );
};

export default CustomInput;
