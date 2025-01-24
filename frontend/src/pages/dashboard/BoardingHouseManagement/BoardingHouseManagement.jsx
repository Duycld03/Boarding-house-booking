import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import {
  Button,
  ConfirmModal,
  TableCustom as Table,
  Loader,
} from "../../../component";
import { DatePicker } from "antd";

function BoardingHouseManagement() {
  // Dữ liệu mẫu cho bảng
  const data = [
    {
      _id: "1",
      name: "John Doe",
      age: 28,
      address: "123 Main St, City, Country",
    },
    {
      _id: "2",
      name: "Jane Smith",
      age: 34,
      address: "456 Another St, City, Country",
    },
    {
      _id: "3",
      name: "Sam Johnson",
      age: 40,
      address: "789 Third St, City, Country",
    },
  ];

  // Các cột cho bảng
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
  ];

  const onProcessData = (combinedData) => {
    console.log("Processed Data: ", combinedData);
  };

  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleMobal = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(!loading);
    }, 1000);
  }, []);

  const handleMessage = () => {
    toast.success("Add success");
  };

  return (
    <div className="txt">
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex justify-between">
            <Button
              btnDelete
              title={"Delete account"}
              size={"large"}
              onClick={handleToggleMobal}
            />
            <Button
              size="large"
              onClick={handleMessage}
              btnAdd
              title="Add new user"
            />
          </div>
          <div>
            <Table
              columns={columns}
              data={data}
              onRowClick={onProcessData}
              loading={loading}
            />
          </div>
          <ConfirmModal
            onCancel={handleToggleMobal}
            isOpen={isOpen}
            content={"Do you want to add new?"}
          />
        </>
      )}
    </div>
  );
}

export default BoardingHouseManagement;
