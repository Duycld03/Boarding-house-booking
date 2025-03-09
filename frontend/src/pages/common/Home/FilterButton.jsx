import { useEffect, useState } from "react";
import { Form, Select, Slider, Checkbox, Drawer, Button, Input, Card } from "antd";
import { FilterOutlined, StarFilled } from "@ant-design/icons";
import { getAllBoardingHouseTypeUser, getMaxPriceBHUser, filterBHUser } from "../../../api/BoardingHManagement";
import formatAmount from "../../../utils/formatAmount";
import { toast } from "react-toastify";
import { getBhByArea } from '../../../api/ownerUser/boardingHouse';

function FilterButton({ setFilterValue }) {
    const [form] = Form.useForm();
    const [priceRange, setPriceRange] = useState({ min: 0, max: 50000000 });
    const [currentPrice, setCurrentPrice] = useState([0, 50000000]);
    const [boardingHouseTypes, setBoardingHouseTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedRatings, setSelectedRatings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1366);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [nameFilter, setNameFilter] = useState("");

    useEffect(() => {
        fetchMaxPrice();
        fetchBoardingHouseTypes();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchMaxPrice = async () => {
        try {
            const maxPriceRes = await getMaxPriceBHUser();
            if (maxPriceRes) {
                const maxPrice = maxPriceRes.maxPrice || 50000000;
                setPriceRange({ min: 0, max: maxPrice });
                setCurrentPrice([0, maxPrice]);
            }
        } catch (error) {
            console.error("Error fetching max price:", error);
        }
    };

    const fetchBoardingHouseTypes = async () => {
        try {
            const typeRes = await getAllBoardingHouseTypeUser();
            if (typeRes?.data) {
                setBoardingHouseTypes(typeRes.data);
            }
        } catch (error) {
            console.error("Error fetching boarding house types:", error);
        }
    };

    const handleResize = () => {
        setIsMobile(window.innerWidth <= 1366);
    };

    const handleSubmit = async () => {
        if (currentPrice[0] > currentPrice[1]) {
            toast.error("Invalid price range. Minimum price cannot be greater than maximum price.");
            return;
        }

        const filters = {
            name: nameFilter || null,
            priceRange: `${currentPrice[0]},${currentPrice[1]}`,
            boardingHouseType: selectedType || null,
            rating: selectedRatings.length > 0 ? selectedRatings.join(",") : null,
        };

        setLoading(true);
        try {
            const response = await getBhByArea(filters);
            console.log(response);
            if (!response || response?.success === false) {
                throw new Error(response?.message || "Failed to apply filters.");
            }

            const rawData = Array.isArray(response) ? response : response?.data || response?.results || [];

            const formattedData = rawData.map((item) => ({
                id: item._id?.$oid || item._id,
                name: item.name,
                price: formatAmount(item.priceRange),
                detail: item.address?.province || "No address provided",
                rating: item.rating || 0,
                reviewCount: item.reviewCount || 0,
                img: item.images?.[0]?.imageUrl || "",
                updatedAt: item.updatedAt,
            }));

            if (formattedData.length > 0) {
                setFilterValue?.(formattedData);
                toast.success(`Found boarding houses!`);
            } else {
                setFilterValue?.([]);
            }
            setFilterValue(filters);
            setOpenDrawer(false);
        } catch (error) {
            console.error("Filter error:", error);
            toast.error(error.message || "Failed to apply filters. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        form.resetFields();
        setCurrentPrice([priceRange.min, priceRange.max]);
        setSelectedType(null);
        setSelectedRatings([]);
        setNameFilter("");
        setFilterValue(null);
    };

    const ratingOptions = [1, 2, 3, 4, 5].map((value) => ({
        label: (
            <>
                {[...Array(value)].map((_, index) => (
                    <StarFilled key={index} style={{ color: "gold", fontSize: "16px", marginRight: "2px" }} />
                ))}
            </>
        ),
        value: value,
    }));

    return (
        <div className="">
            <div className="flex flex-col gap-2 lg:hidden w-full md:w-[200px]">
                <Button
                    type="primary"
                    icon={<FilterOutlined />}
                    onClick={() => setOpenDrawer(true)}
                    block
                    size="large"
                    className="bg-green-600 border-green-600 text-white"
                >
                    Filter
                </Button>
            </div>
            <Drawer
                title="Filter"
                placement="left"
                closable={true}
                onClose={() => setOpenDrawer(false)}
                open={isMobile && openDrawer}
                width={320}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Card className="mb-6" bordered style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
                        <Form.Item label="Name" name="name">
                            <Input
                                placeholder="Enter name"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                className="mt-4"
                            />
                        </Form.Item>
                    </Card>
                    <Card className="mb-6" bordered style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
                        <Form.Item label="Price">
                            <div className="flex justify-between text-lg mt-1 mb-2 font-semibold">
                                <p className="truncate max-w-[40%] mt-4">
                                    Min: {formatAmount(currentPrice[0])}
                                </p>
                                <p className="truncate max-w-[40%] text-right mt-4">
                                    Max: {formatAmount(currentPrice[1])}
                                </p>
                            </div>
                            <Slider
                                range
                                min={priceRange.min}
                                max={priceRange.max}
                                step={100000}
                                value={currentPrice}
                                onChange={setCurrentPrice}
                            />
                        </Form.Item>
                    </Card>
                    <Card className="mb-6" bordered style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
                        <Form.Item label="Boarding house type">
                            <Select
                                placeholder="Choose type"
                                value={selectedType}
                                onChange={setSelectedType}
                                allowClear
                                options={boardingHouseTypes}
                                className="mt-4"

                            />
                        </Form.Item>
                    </Card>
                    <Card className="mb-6" bordered style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
                        <Form.Item label="Rating">
                            <Checkbox.Group
                                options={ratingOptions}
                                value={selectedRatings}
                                onChange={setSelectedRatings}
                                style={{ display: "flex", flexDirection: "column" }}
                            />
                        </Form.Item>
                    </Card>
                    <div className="flex justify-between mt-6">
                        <Button type="primary" htmlType="submit" loading={loading} className="w-1/2 text-lg">
                            Apply
                        </Button>
                        <Button onClick={handleReset} className="bg-red-500 text-white w-1/2">
                            Reset
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </div>
    );
}

export default FilterButton;