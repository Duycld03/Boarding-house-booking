import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { BackHeader } from '@/components/navigation/CustomHeader';
import VerticalList from '@/components/ui/VerticalList';
import LoadMoreButton from '@/components/ui/LoadMoreButton';
import { getAllBHHome } from '@/API/boardingHouseAPI';
import { useTranslation } from 'react-i18next';

function AllBHScreen() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 6;
  const { t } = useTranslation('home');

  const fetchData = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await getAllBHHome({ page: currentPage, limit });

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
      setTotalItems(res?.pagination?.totalItems || newData.length);
    } catch (error) {
      console.error('Error fetching boarding houses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handleLoadMore = () => {
    if (data.length < totalItems) {
      setPage((prev) => prev + 1);
    }
  };

  const hasMore = data.length < totalItems;

  return (
    <ScreenContainer withPadding={false}>
      <BackHeader title={t('All')} />
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

export default AllBHScreen;
