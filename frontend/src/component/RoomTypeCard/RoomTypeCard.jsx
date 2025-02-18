import { Card, Typography, Divider, Button } from "antd";
import formatAmount from "../../utils/formatAmount";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserAlt } from "@fortawesome/free-solid-svg-icons";
import CreateAppointmentForm from "../../pages/common/BoardingHouseDetail/CreateAppointmentForm";
import { useEffect, useState } from "react";
import { getRoomsByRoomType } from "../../api/room";
import { toast } from "react-toastify";

const { Title, Paragraph, Text } = Typography;

const RoomCard = ({ roomData }) => {
  const [listRoomData, setListRoomData] = useState([]);

  const fetchRoomByRoomTypeId = async () => {
    try {
      const res = await getRoomsByRoomType(roomData?._id);
      if (res) {
        setListRoomData(res);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy dữ liệu phòng: " + error.message);
    }
  };

  useEffect(() => {
    fetchRoomByRoomTypeId();
  }, []);

  return (
    <Card className=" w-5/6 mx-auto  mt-6 rounded-lg shadow-md" hoverable>
      {/* image */}
      <div className="w-full flex flex-wrap gap-10">
        <img
          className="max-h-[400px] md:w-1/2 sm:w-full object-cover rounded-lg"
          src={roomData?.image?.imageUrl}
        />

        {/* content */}
        <div className="flex flex-1 gap-x-10 justify-evenly flex-col px-5">
          <Title level={3} className="text-gray-800 font-bold">
            {roomData?.typeName}
          </Title>
          <Divider className="border-gray-500" />
          <div className="flex justify-between">
            <Paragraph className="text-orange-500 font-semibold md:text-3xl">
              {formatAmount(roomData?.price)} (VND)/ month
            </Paragraph>
            <Paragraph className="flex gap-2 items-center text-gray-600 md:text-2xl">
              <Text className="font-semibold md:text-2xl">Guest(s): </Text>
              <Text className="md:text-2xl">{roomData?.peopleNumber}x</Text>
              <FontAwesomeIcon icon={faUserAlt} />
            </Paragraph>
          </div>

          <Paragraph className="text-gray-600 md:text-2xl">
            <Text className="font-semibold md:text-2xl">Acreage:</Text>
            <Text className="md:text-2xl"> {roomData?.roomSize}m²</Text>
          </Paragraph>
          <Paragraph className="text-gray-600 md:text-2xl">
            <Text className="font-semibold md:text-2xl">Nội thất: </Text>
            <Text className="md:text-2xl">
              {roomData?.facilities?.map((item) => item.name).join(", ")}
            </Text>
          </Paragraph>
          <Paragraph className="text-gray-600 md:text-2xl">
            <Text className="font-semibold md:text-2xl">
              Number of rooms available:
            </Text>
            <Text className="md:text-2xl"> {roomData?.availableRoom}</Text>
          </Paragraph>

          <Divider className="border-gray-500" />

          <div className="flex justify-between mt-4">
            <Button
              className="bg-primary text-white md:min-w-[200px]  py-2 px-4 rounded-xl"
              size="large"
            >
              Deposit
            </Button>
            <CreateAppointmentForm
              listRoomData={listRoomData}
              ownerId={roomData?.boardingHouseId?.ownerId}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RoomCard;
