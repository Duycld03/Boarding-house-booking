import React, { useState, useCallback } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import ScreenContainer, {
  ScrollContainer,
} from '@/components/layout/ScreenContainer';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import HorizontalList from '@/components/ui/HorizontalList';
import { getBhByArea } from '@/API/ownerUser/boardingHouse';
import formatAmount from '@/utils/formatAmount';
import { useTranslation } from 'react-i18next';
import Loader from '@/components/ui/Loader';

function Home() {
  const { themedClasses } = useThemedClasses();
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation('home');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Gọi lại khi tab được focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await getBhByArea({});

          if (!Array.isArray(res)) {
            if (isActive) setData([]);
            return;
          }

          const formatted = res.map((item) => {
            const img =
              item.images?.find((i) => i.isPrimary)?.imageUrl ||
              item.images?.[0]?.imageUrl ||
              '';
            return {
              id: item._id?.$oid || item._id,
              name: item.name,
              price: formatAmount(item.priceRange),
              detail: item.address?.province,
              rating: item.rating || 0,
              reviewCount: item.reviewCount || 0,
              img,
              updatedAt: item.updatedAt || 0,
            };
          });

          if (isActive) setData(formatted);
        } catch (error) {
          console.error('Error fetching BH:', error);
          if (isActive) setData([]);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchData();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const newestData = [...data]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 10);

  const highRatingData = [...data]
    .filter((i) => i.rating >= 3)
    .sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating)
    .slice(0, 10);

  const SectionHeader = ({ title, link }: { title: string, link: string }) => (
    <View className="flex-row justify-between items-center mt-6 mb-2">
      <Text
        className={themedClasses(
          'text-lg font-extrabold text-gray-800 ml-2',
          'text-lg font-extrabold text-text-dark ml-2'
        )}
      >
        {title}
      </Text>
      <TouchableOpacity onPress={() => router.push(link)}>
        <Text className="text-lg font-bold text-sky-400 tracking-tight mr-2">
          {t('seeMore')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <ScreenContainer className={themedClasses.bg} withPadding={false}>
      <ScrollContainer keyboardAvoiding className="px-4">
        <SectionHeader title={t('All')} link="/allBH" />
        <HorizontalList data={data} />

        <SectionHeader title={t('newest')} link="/newestBH" />
        <HorizontalList data={newestData} />

        <SectionHeader title={t('rating')} link="/highRatingBH" />
        <HorizontalList data={highRatingData} />
      </ScrollContainer>
    </ScreenContainer>
  );
}

export default Home;
