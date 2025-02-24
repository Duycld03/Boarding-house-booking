import { useState, useEffect } from "react";
import { getFavorite, deleteFavorite } from "../../../api/favoriteManagement";
import { List, Spin, Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import WatchLaterCard from "../../../component/WatchLaterCard";

const FavouriteList = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const navigate = useNavigate();

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

    const paginatedFavorites = favorites.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", minHeight: "500px" }}>
            {loading ? (
                <Spin size="large" style={{ display: "block", textAlign: "center", margin: "20px" }} />
            ) : (
                <>
                    <List
                        itemLayout="vertical"
                        dataSource={paginatedFavorites}
                        renderItem={(item, index) => (
                            <WatchLaterCard
                                key={item.id}
                                item={item}
                                index={(currentPage - 1) * pageSize + index}
                                onCardClick={(id) => navigate(`/boarding-house/${id}`)}
                                onDelete={handleDeleteFavorite}
                                getPrimaryImage={getPrimaryImage}
                                formatAddress={formatAddress}
                            />
                        )}
                    />

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={favorites.length}
                            onChange={(page, size) => {
                                setCurrentPage(page);
                                setPageSize(size);
                            }}

                            pageSizeOptions={["5", "10", "20"]}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default FavouriteList;