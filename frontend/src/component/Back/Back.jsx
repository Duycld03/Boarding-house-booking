import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const Back = () => {
  const navigate = useNavigate();
  return <ArrowLeftOutlined onClick={() => navigate(-1)} />;
};

export default Back;
