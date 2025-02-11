import React from "react";
import { Card, Avatar, Typography, Divider, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import formatAmount from "../../utils/formatAmount";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faUserAlt } from "@fortawesome/free-solid-svg-icons";

const { Title, Paragraph, Text } = Typography;

const RoomCard = ({ roomData }) => {
  return (
    <Card
      className=" w-5/6 mx-auto bg-gray-100 mt-6 rounded-lg shadow-md md:p-4"
      hoverable
    >
      {/* image */}
      <div className="w-full flex flex-wrap">
        <img
          className="max-h-[400px] md:w-1/2 sm:w-full object-cover rounded-lg"
          src={`${import.meta.env.VITE_BASE_URL}/${roomData?.imageURL}`}
        />

        {/* content */}
        <div className="flex flex-1 gap-x-10 justify-between flex-col px-5">
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
              className="bg-primary text-white md:min-w-[200px] font-bold py-2 px-4 rounded-md"
              size="large"
            >
              Deposit
            </Button>
            <Button
              size="large"
              className="bg-red-400 md:min-w-[200px] text-white font-bold py-2 px-4 rounded-md"
            >
              Make appointment
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RoomCard;
