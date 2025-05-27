import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Nếu bạn dùng expo-router
import ScreenContainer, {
  ScrollContainer,
} from '@/components/layout/ScreenContainer';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { BackHeader } from '@/components/navigation/CustomHeader';
import HorizontalList from '@/components/ui/HorizontalList';

function Home() {
  const { themedClasses } = useThemedClasses();
  const { theme } = useTheme(); // light | dark
  const router = useRouter();

  const mockData = [
    {
      id: 1,
      name: 'Sunny Boarding House',
      price: '2,500,000',
      detail: 'Thành phố Cần Thơ',
      rating: 4.5,
      img: 'https://picsum.photos/400/200',
      updatedAt: new Date().toISOString(),
      isFavorite: false,
    },
    {
      id: 2,
      name: 'Cozy Boarding House',
      price: '3,000,000',
      detail: 'Quận 1, TP.HCM',
      rating: 4,
      img: 'https://picsum.photos/401/200',
      updatedAt: new Date().toISOString(),
      isFavorite: true,
    },
    {
      id: 3,
      name: 'Cozy Boarding House 2',
      price: '3,000,000',
      detail: 'Quận 1, TP.HCM',
      rating: 4,
      img: 'https://picsum.photos/402/200',
      updatedAt: new Date().toISOString(),
      isFavorite: true,
    },
    {
      id: 4,
      name: 'Modern Studio',
      price: '4,000,000',
      detail: 'Thủ Đức, TP.HCM',
      rating: 4.8,
      img: 'https://picsum.photos/403/200',
      updatedAt: new Date().toISOString(),
      isFavorite: true,
    },
  ];

  const SectionHeader = ({ title, link }: { title: string, link: string }) => (
    <View className="flex-row justify-between items-center mt-6 mb-2">
      <Text
        className={themedClasses(
          'text-lg font-extrabold text-gray-800 text-center',
          'text-lg font-extrabold text-text-dark text-center'
        )}
      >
        {title}
      </Text>
      <TouchableOpacity onPress={() => router.push(link)}>
        <Text className="text-lg font-bold text-sky-400 tracking-tight">
          See More
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer className={themedClasses.bg} withPadding={false}>
      <BackHeader title="Home" />
      <ScrollContainer keyboardAvoiding className="px-4">
        <SectionHeader title="All" link="/allBH" />
        <HorizontalList data={mockData} />

        <SectionHeader title="Newest" link="/newestBH" />
        <HorizontalList data={mockData} />

        <SectionHeader title="High Rating" link="/highRatingBH" />
        <HorizontalList data={mockData} />
      </ScrollContainer>
    </ScreenContainer>
  );
}

export default Home;
