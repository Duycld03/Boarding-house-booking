import { useState, useEffect } from "react";
import { getFavorite, deleteFavorite } from "../../../api/favoriteManagement";
import { List, Card, Typography, Spin, Image, Rate } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const FavouriteList = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const { Title, Text } = Typography;
    const navigate = useNavigate();

    const handleCardClick = (id) => {
        navigate(`/boarding-house/${id}`);
    };
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await getFavorite();
                if (response && Array.isArray(response.favorites)) {
                    setFavorites(response.favorites);
                }
            } catch (error) {
                console.error("Error fetching favorites:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    const getPrimaryImage = (images) => {
        if (!Array.isArray(images) || images.length === 0) {
            return "https://via.placeholder.com/200";
        }
        const primaryImage = images.find((img) => img.isPrimary);
        return primaryImage ? primaryImage.imageUrl : images[0].imageUrl;
    };

    const handleDeleteFavorite = async (id) => {
        try {
            const response = await deleteFavorite(id);
            if (response && response.isFavorite === false) {
                toast.success("Delete favorite successfully");
                setFavorites((prevFavorites) => prevFavorites.filter((item) => item.id !== id));
            } else {
                toast.error("Failed to delete favorite");
            }
        } catch (error) {
            console.error("Lỗi xóa yêu thích:", error);
            toast.error("Failed to delete favorite");
        }
    };
    const formatAddress = (address) => {
        if (typeof address === "object" && address !== null) {
            const { province, district, ward, detail } = address;
            return `${detail}, ${ward}, ${district}, ${province}`;
        }
        return "None address";
    };

    return (
        <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
            {loading ? (
                <Spin size="large" style={{ display: "block", textAlign: "center", margin: "20px" }} />
            ) : (
                <List
                    itemLayout="vertical"
                    dataSource={favorites}
                    renderItem={(item, index) => (
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
                                }}
                                bodyStyle={{ padding: 0 }}
                                onClick={() => handleCardClick(item.id)}
                            >
                                <div style={{
                                    display: "flex",

                                }}>
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

                                    {/*Info*/}
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
                                        <Text style={{ display: "block", marginTop: 5 }}>{formatAddress(item.address)}</Text>
                                    </div>
                                </div>
                                {/* delete */}
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: "10px",
                                        right: "10px",
                                        cursor: "pointer",
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFavorite(item.id);
                                    }}
                                >
                                    <DeleteOutlined style={{ fontSize: "20px", color: "#ff4d4f" }} />
                                </div>
                            </Card>
                        </div>
                    )}
                />
            )}
        </div>
    );
};

export default FavouriteList;