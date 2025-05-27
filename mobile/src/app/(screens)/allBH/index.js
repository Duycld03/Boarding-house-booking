import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Nếu bạn dùng expo-router
import ScreenContainer, {
  ScrollContainer,
} from '@/components/layout/ScreenContainer';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { BackHeader } from '@/components/navigation/CustomHeader';
import VerticalList from '@/components/ui/VerticalList';
import { getBhByArea } from '@/API/ownerUser/boardingHouse';
import formatAmount from '@/utils/formatAmount';
import { useTranslation } from 'react-i18next';

function AllBHScreen() {
  const { themedClasses } = useThemedClasses();
  const { theme } = useTheme(); // light | dark
  const router = useRouter();
  const [dataFromApi, setDataFromApi] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('home');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getBhByArea({}); // truyền filter nếu có

        if (!Array.isArray(res)) {
          setDataFromApi([]);
          return;
        }

        const formattedData = res.map((item) => {
          const imgPath =
            item.images?.find((img) => img.isPrimary)?.imageUrl ||
            item.images?.[0]?.imageUrl ||
            '';
          return {
            id: item._id?.$oid || item._id,
            name: item.name,
            price: formatAmount(item.priceRange),
            detail: item.address?.province,
            rating: item.rating || 0,
            reviewCount: item.reviewCount || 0,
            img: imgPath,
            updatedAt: item.updatedAt || 0,
          };
        });

        setDataFromApi(formattedData);
      } catch (error) {
        console.error('Error fetching boarding houses:', error);
        setDataFromApi([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dữ liệu dùng để render
  const dataToUse = dataFromApi;

  return (
    <ScreenContainer className={themedClasses.bg} withPadding={false}>
      <BackHeader title="All Boarding House" />
      <View className="px-4" style={{ flex: 1 }}>
        <VerticalList data={dataToUse} loading={loading} />
      </View>
    </ScreenContainer>
  );
}

export default AllBHScreen;
