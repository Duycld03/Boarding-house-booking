import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { BackHeader } from '@/components/navigation/CustomHeader';
import VerticalList from '@/components/ui/VerticalList';
import LoadMoreButton from '@/components/ui/LoadMoreButton';
import { getNewestBH } from '@/API/boardingHouseAPI';
import formatAmount from '@/utils/formatAmount';
import { useTranslation } from 'react-i18next';

function NewestBHScreen() {
  const { themedClasses } = useThemedClasses();
  const { theme } = useTheme();
  const router = useRouter();
  const { t, i18n } = useTranslation('home');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 6;

  const fetchData = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await getNewestBH({ page: currentPage, limit });

      const newData =
        res?.data?.map((item) => {
          const imgPath =
            item.images?.find((img) => img.isPrimary)?.imageUrl ||
            item.images?.[0]?.imageUrl ||
            '';
          return {
            id: item._id,
            name: item.name,
            price: item.priceRange,
            detail:
              item.address?.province?.[
                i18n.language === 'en' ? 'name_en' : 'name'
              ] || '',
            rating: item.rating || 0,
            reviewCount: item.reviewCount || 0,
            img: imgPath,
            updatedAt: item.updatedAt || 0,
          };
        }) || [];

      setData((prev) => (currentPage === 1 ? newData : [...prev, ...newData]));
      setTotalItems(res?.pagination?.totalItems || newData.length);

      // Optional debug
      console.log({
        page: currentPage,
        rawDataLength: newData.length,
        totalItems: res?.pagination?.totalItems,
      });
    } catch (error) {
      console.error('Error fetching newest boarding houses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const hasMore = data.length < totalItems;

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <BackHeader title={t('newest', 'Mới nhất')} />
      <View className="px-4" style={{ flex: 1 }}>
        <VerticalList data={data} loading={loading} />
        <LoadMoreButton
          hasMore={hasMore}
          isLoading={loading}
          onLoadMore={handleLoadMore}
          currentCount={data.length}
          totalCount={totalItems}
          itemsPerPage={limit}
          itemName="boarding houses"
        />
      </View>
    </ScreenContainer>
  );
}

export default NewestBHScreen;
