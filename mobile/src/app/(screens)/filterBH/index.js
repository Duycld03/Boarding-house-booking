import React, { useEffect, useState, useCallback } from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getBhByArea } from '@/API/boardingHouseAPI';
import formatAmount from '@/utils/formatAmount';
import { ScreenContainer } from '@/components/layout';
import VerticalList from '@/components/ui/VerticalList';
import LoadMoreButton from '@/components/ui/LoadMoreButton';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import { BackHeader } from '@/components/navigation/CustomHeader';
import { FontAwesome5 } from '@expo/vector-icons';
import { useThemedClasses } from '@/utils/useTheme';
import { useTheme } from '@/context/ThemeProvider';
import { useTranslation } from 'react-i18next';

const FilteredResultScreen = () => {
    const { themedClasses, isDarkMode } = useThemedClasses();
    const { name, priceRange, boardingHouseType, rating, province, district, ward } = useLocalSearchParams();

    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 6;
    const { t } = useTranslation('filter');

    // Giả sử frontend đang nhập theo đơn vị đồng (VND), thì convert sang nghìn đồng nếu backend dùng 1000 VND:
    const parsePriceRange = (rangeStr: string) => {
        const [min, max] = (rangeStr || '').split(',').map(Number);
        return {
            priceMin: Math.floor((min || 0) / 1000),
            priceMax: Math.ceil((max || 50000000) / 1000),
        };
    };


    const { priceMin, priceMax } = parsePriceRange(priceRange);

    const fetchFilteredData = useCallback(async (currentPage = 1) => {
        if (currentPage === 1) setInitialLoading(true);
        setLoading(true);

        try {
            // ⚠️ Chuẩn bị bộ lọc gửi tới backend
            const filters = {
                page: currentPage,
                limit,
                ...(name?.trim() && { name: name.trim() }),
                ...(priceMin !== undefined && { priceMin }),
                ...(priceMax !== undefined && { priceMax }),
                ...(boardingHouseType && boardingHouseType !== 'null' && { boardingHouseType }),
                ...(rating && rating !== 'null' && { rating }),
                ...(province && province !== 'null' && { 'address.province': province }),
                ...(district && district !== 'null' && { 'address.district': district }),
                ...(ward && ward !== 'null' && { 'address.ward': ward }),
            };

            console.log("🚀 Sent filters:", filters);

            // Gọi API lấy dữ liệu
            const res = await getBhByArea(filters);
            console.log("mtien", res);

            // Dữ liệu trả về từ backend
            const list = Array.isArray(res) ? res : res?.data || res?.results || [];
            let filteredList = list;

            // Filter theo địa chỉ (ở frontend vì backend không xử lý được)
            if (province) {
                filteredList = filteredList.filter((bh) =>
                    bh.address?.province?.toLowerCase().includes(province.toLowerCase())
                );
            }
            if (district) {
                filteredList = filteredList.filter((bh) =>
                    bh.address?.district?.toLowerCase().includes(district.toLowerCase())
                );
            }
            if (ward) {
                filteredList = filteredList.filter((bh) =>
                    bh.address?.ward?.toLowerCase().includes(ward.toLowerCase())
                );
            }

            console.log("📦 Received list:", list);

            // Xử lý dữ liệu trả về để hiển thị
            const formatted = filteredList.map((item) => ({
                id: item._id,
                name: item.name,
                price: item.priceRange ? `${item.priceRange}k VND` : 'N/A',
                address: `${item.address?.province || ''}, ${item.address?.district || ''}, ${item.address?.ward || ''}`.trim(),
                availableRooms: item.availableRooms || 0,
                rating: item.rating || 0,
                img: item.images?.find((img) => img.isPrimary)?.imageUrl || item.images?.[0]?.imageUrl || '',
                updatedAt: new Date(item.updatedAt).toLocaleDateString(), // Format ngày
            }));

            // Cập nhật state
            if (currentPage === 1) {
                setData(formatted); // Dữ liệu trang đầu tiên
            } else {
                setData((prev) => [...prev, ...formatted]); // Load thêm dữ liệu
            }

            setTotalItems(filteredList.length);
        } catch (err) {
            console.error('Filtered fetch failed:', err);
            setData([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
            if (currentPage === 1) setInitialLoading(false);
        }
    }, [name, priceMin, priceMax, boardingHouseType, rating, province, district, ward]);


    useEffect(() => {
        setPage(1);
        fetchFilteredData(1);
    }, [name, priceRange, boardingHouseType, rating, province, district, ward]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        if (data.length < totalItems && !loading) {
            setPage(nextPage);
            fetchFilteredData(nextPage);
        }
    };

    const hasMore = data.length < totalItems;

    return (
        <ScreenContainer className={themedClasses.bg} withPadding={false}>
            {initialLoading ? (
                <Loader overlay />
            ) : (
                <>
                    <BackHeader
                        title={t('filterResultTitle')}
                        backIcon={
                            <FontAwesome5
                                name="chevron-left"
                                size={18}
                                color={isDarkMode ? '#fff' : '#333'}
                            />
                        }
                    />
                    <Text style={{ paddingHorizontal: 16, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                        {t('totalResults', { count: totalItems })}
                    </Text>
                    {data.length === 0 && !loading ? (
                        <EmptyState
                            title={t('emptyTitle')}
                            message={t('emptyMessage')}
                        />
                    ) : (
                        <>
                            <VerticalList data={data} loading={loading} />
                            <LoadMoreButton
                                hasMore={hasMore}
                                isLoading={loading}
                                onLoadMore={handleLoadMore}
                                currentCount={data.length}
                                totalCount={totalItems}
                                itemsPerPage={limit}
                                itemName={t('itemName')}
                            />
                        </>
                    )}
                </>
            )}
        </ScreenContainer>
    );
};

export default FilteredResultScreen;
