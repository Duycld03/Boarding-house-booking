import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Nếu bạn dùng expo-router
import ScreenContainer, {
  ScrollContainer,
} from '@/components/layout/ScreenContainer';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { BackHeader } from '@/components/navigation/CustomHeader';
import HorizontalList from '@/components/ui/HorizontalList';
import { getBhByArea } from '@/API/ownerUser/boardingHouse';
import formatAmount from '@/utils/formatAmount';
import { useTranslation } from 'react-i18next';

function Home() {
  const { themedClasses } = useThemedClasses();
  const { theme } = useTheme(); // light | dark
  const router = useRouter();

  // --- State dữ liệu lấy từ API
  const [dataFromApi, setDataFromApi] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('home');

  // --- Gọi API khi mount
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

  // Tạo bộ dữ liệu newest và highRating
  const newestData = [...dataToUse]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 10);

  const highRatingData = [...dataToUse]
    .filter((item) => item.rating >= 3)
    .sort((a, b) => {
      if (b.reviewCount !== a.reviewCount) {
        return b.reviewCount - a.reviewCount;
      }
      return b.rating - a.rating;
    })
    .slice(0, 10);

  const SectionHeader = ({ title, link }: { title: string, link: string }) => (
    <View className="flex-row justify-between items-center mt-6 mb-2">
      <Text
        className={themedClasses(
          'text-lg font-extrabold text-gray-800 text-center ml-2',
          'text-lg font-extrabold text-text-dark text-center ml-2'
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

  return (
    <ScreenContainer className={themedClasses.bg} withPadding={false}>
      <BackHeader title="Home" />
      <ScrollContainer keyboardAvoiding className="px-4">
        <SectionHeader title={t('All')} link="/allBH" />
        <HorizontalList data={dataToUse} loading={loading} />

        <SectionHeader title={t('newest')} link="/newestBH" />
        <HorizontalList data={newestData} loading={loading} />

        <SectionHeader title={t('rating')} link="/highRatingBH" />
        <HorizontalList data={highRatingData} loading={loading} />
      </ScrollContainer>
    </ScreenContainer>
  );
}

export default Home;
