import { Card, Typography, Image, Rate } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const WatchLaterCard = ({ item, index, onCardClick, onDelete, getPrimaryImage, formatAddress }) => {
    return (
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
            <div
                style={{
                    width: "50px",
                    minWidth: "50px",
                    textAlign: "center",
                    fontSize: "16px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "8px 0 0 8px",
                    paddingLeft: "10px",
                    background: "#f5f5f5",
                    fontWeight: "bold",
                    height: 142,
                    alignContent: "center",
                    backgroundColor: "white"
                }}
            >
                {index + 1}
            </div>
            <Card
                style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    border: "1px solid #d9d9d9",
                    borderRadius: "0 8px 8px 0",
                    padding: 10,
                    cursor: "pointer",
                    position: "relative",
                }}
                bodyStyle={{ padding: 0 }}
                onClick={() => onCardClick(item.id)}
            >
                <div style={{ display: "flex" }}>
                    {/* Image */}
                    <div
                        style={{
                            width: "200px",
                            minWidth: "200px",
                            height: "120px",
                            background: "#e0e0e0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "15px",
                            borderRadius: "4px",
                            overflow: "hidden",
                        }}
                    >
                        <Image
                            alt={item.name}
                            src={getPrimaryImage(item.img)}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            preview={false}
                        />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <Title level={5} style={{ margin: 0 }}>
                            {item.name}
                        </Title>
                        {item.boardingHouseType && (
                            <Text type="secondary">{item.boardingHouseType}</Text>
                        )}
                        <div style={{ marginTop: 5 }}>
                            <Rate disabled defaultValue={item.rating} />
                        </div>
                        <Text style={{ display: "block", marginTop: 5 }}>
                            {formatAddress(item.address)}
                        </Text>
                    </div>
                </div>
                {/* Delete */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        cursor: "pointer",
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                    }}
                >
                    <DeleteOutlined style={{ fontSize: "20px", color: "#ff4d4f" }} />
                </div>
            </Card>
        </div>
    );
};

export default WatchLaterCard;