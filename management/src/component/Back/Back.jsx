import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/themeContext"; // Điều chỉnh đường dẫn nếu cần
import { useTranslation } from "react-i18next";

const Back = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { t } = useTranslation();

  return (
    <div
      className={`flex items-center cursor-pointer transition-colors duration-200 ${
        darkMode
          ? "text-text-dark hover:text-blue-400"
          : "text-text-light hover:text-blue-600"
      }`}
      onClick={() => navigate(-1)}
    >
      <ArrowLeftOutlined
        className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"}`}
      />
      <span
        className={`ml-2 font-body ${
          darkMode ? "text-gray-300" : "text-gray-700"
        }`}
      ></span>
    </div>
  );
};

export default Back;
