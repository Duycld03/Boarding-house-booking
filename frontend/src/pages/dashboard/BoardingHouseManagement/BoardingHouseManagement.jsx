import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import {
  Button,
  ConfirmModal,
  TableCustom as Table,
  Loader,
} from "../../../component";
import { getAllBoardingHDB } from "../../../api/BoardingHManagement";
import formatAmount from "../../../utils/formatAmount";
import convertTimetap from "../../../utils/convertTimetap";

function BoardingHouseManagement() {
  const [boardingHData, setBoardingHData] = useState([]);
  const [loading, setLoading] = useState(true); // Initially set to true
  const [isOpen, setIsOpen] = useState(false);

  // fetch data
  const fetchData = async () => {
    setLoading(true); // Start loading before fetching
    try {
      const res = await getAllBoardingHDB();
      if (res) {
        setBoardingHData(res);
        console.log(res);
      } else {
        setBoardingHData([]);
      }
    } catch (error) {
      console.error("Failed to fetch withdrawal requests:", error);
      toast.error(
        "Failed to fetch withdrawal requests. Please try again later."
      );
      setBoardingHData([]);
    } finally {
      setLoading(false); // Stop loading after fetching is done
    }
  };

  useEffect(() => {
    fetchData().finally(setLoading(false));
  }, []); //

  // Table column
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (text) => {
        return text
          ? ` ${text.detail}, ${text.ward}, ${text.district}, ${text.province}`
          : "";
      },
    },
    {
      title: "Price Range (VND)",
      dataIndex: "priceRange",
      key: "priceRange",
      render: (text) => {
        return `${formatAmount(text)}/month`;
      },
    },
    {
      title: "Boarding House Type",
      dataIndex: "boardingHouseType",
      key: "boardingHouseType",
      render: (text) => {
        return text ? text.name : "";
      },
    },
    {
      title: "Total Rooms",
      dataIndex: "totalRooms",
      key: "totalRooms",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => {
        return convertTimetap(text);
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          btnDelete
          title={"Delete"}
          onClick={() => handleDelete(record._id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const onProcessData = (combinedData) => {
    console.log("Processed Data: ", combinedData);
  };

  const handleToggleMobal = () => {
    setIsOpen(!isOpen);
  };

  const handleMessage = () => {
    toast.success("Add success");
  };

  const handleDelete = (id) => {
    console.log(id);
  };

  return (
    <div className="txt">
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex justify-between">
            <Button
              size="large"
              onClick={handleMessage}
              btnAdd
              title="Add new user"
            />
            <Button
              btnFilter
              title={"Filter"}
              size={"large"}
              onClick={handleToggleMobal}
            />
          </div>
          <div>
            <Table
              columns={columns}
              data={boardingHData}
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
