import React, { useEffect, useState, useCallback } from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getBhByArea } from '@/API/boardingHouseAPI';
import formatAmount from '@/utils/formatAmount';
import { ScreenContainer } from '@/components/layout';
import VerticalList from '@/components/ui/VerticalList';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import { BackHeader } from '@/components/navigation/CustomHeader';
import { FontAwesome5 } from '@expo/vector-icons';
import { useThemedClasses } from '@/utils/useTheme';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import LoadMoreButton from '@/components/ui/LoadMoreButton';
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
    const hasMore = data.length < totalItems;

    const parsePriceRange = (rangeStr: string) => {
        const [min, max] = (rangeStr || '').split(',').map(Number);
        return {
            priceMin: Math.floor((min || 0) / 1000),
            priceMax: Math.ceil((max || 50000000) / 1000),
        };
    };

    const { priceMin, priceMax } = parsePriceRange(priceRange);

    const fetchFilteredData = useCallback(async () => {
        if (page === 1) setInitialLoading(true);
        setLoading(true);

        try {
            const filters = {
                page,
                limit,
                ...(name?.trim() && { name: name.trim() }),
                ...(priceMin !== undefined && { priceMin }),
                ...(priceMax !== undefined && { priceMax }),
                ...(boardingHouseType && boardingHouseType !== 'null' && { boardingHouseType }),
                ...(rating && rating !== 'null' && { rating }),
                ...(province && province !== 'null' && { province }),
                ...(district && district !== 'null' && { district }),
                ...(ward && ward !== 'null' && { ward }),
            };

            const res = await getBhByArea(filters);
            const list = Array.isArray(res) ? res : res?.data || res?.results || [];

            const formatted = list.map((item) => ({
                id: item._id,
                name: item.name,
                price: item.priceRange ? `${item.priceRange}k VND` : 'N/A',
                address: `${item.address?.province || ''}, ${item.address?.district || ''}, ${item.address?.ward || ''}`.trim(),
                availableRooms: item.availableRooms || 0,
                rating: item.rating || 0,
                img: item.images?.find((img) => img.isPrimary)?.imageUrl || item.images?.[0]?.imageUrl || '',
                updatedAt: new Date(item.updatedAt).toLocaleDateString(),
            }));

            setData((prev) => (page === 1 ? formatted : [...prev, ...formatted]));
            setTotalItems(res?.totalDocs ?? list.length);

        } catch (err) {
            console.error(err);
            if (page === 1) setData([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
            if (page === 1) setInitialLoading(false);
        }
    }, [page, name, priceMin, priceMax, boardingHouseType, rating, province, district, ward]);

    useEffect(() => { }, [data, totalItems]);
    useEffect(() => {
        fetchFilteredData();
    }, [page]);
    useEffect(() => {
        setPage(1);
    }, [name, priceRange, boardingHouseType, rating, province, district, ward]);

    const handleLoadMore = () => {
        if (hasMore && !loading) {
            setPage((prev) => prev + 1);
        }
    };

    return (
        <ScreenContainer withPadding={false}>
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
                    <Text
                        style={{
                            paddingHorizontal: 16,
                            fontSize: 16,
                            fontWeight: 'bold',
                            marginBottom: 8,
                            color: isDarkMode ? '#fff' : '#000',
                        }}
                    >
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
                            {hasMore && (
                                <LoadMoreButton
                                    hasMore={hasMore}
                                    isLoading={loading}
                                    onLoadMore={handleLoadMore}
                                    currentCount={data.length}
                                    totalCount={totalItems}
                                    itemsPerPage={limit}
                                    itemName={t('itemName')}
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </ScreenContainer>
    );
};

export default FilteredResultScreen;
