import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { BackHeader } from '@/components/navigation/CustomHeader';
import VerticalList from '@/components/ui/VerticalList';
import LoadMoreButton from '@/components/ui/LoadMoreButton';
import { getHighRatingBH } from '@/API/boardingHouseAPI';
import formatAmount from '@/utils/formatAmount';
import { useTranslation } from 'react-i18next';

function HighRatingBHScreen() {
  const { themedClasses } = useThemedClasses();
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation('home');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 6;

  const fetchData = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await getHighRatingBH({ page: currentPage, limit });

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
            detail: item.address?.province,
            rating: item.rating || 0,
            reviewCount: item.reviewCount || 0,
            img: imgPath,
            updatedAt: item.updatedAt || 0,
          };
        }) || [];

      setData((prev) => (currentPage === 1 ? newData : [...prev, ...newData]));
    } catch (error) {
      console.error('Error fetching high rating boarding houses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  // ✅ Nếu dữ liệu nhận được đúng bằng `page * limit`, có thể còn trang sau
  const hasMore = data.length === page * limit;

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <ScreenContainer className={themedClasses.bg} withPadding={false}>
      <BackHeader title={t('rating', 'Đánh giá cao')} />
      <View className="px-4" style={{ flex: 1 }}>
        <VerticalList data={data} loading={loading} />
        <LoadMoreButton
          hasMore={hasMore}
          isLoading={loading}
          onLoadMore={handleLoadMore}
          currentCount={data.length}
          totalCount={data.length + (hasMore ? 1 : 0)} // giả lập
          itemsPerPage={limit}
          itemName="boarding houses"
        />
      </View>
    </ScreenContainer>
  );
}

export default HighRatingBHScreen;
