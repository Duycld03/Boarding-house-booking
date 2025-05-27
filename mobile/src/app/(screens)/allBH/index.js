import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Nếu bạn dùng expo-router
import ScreenContainer, {
  ScrollContainer,
} from '@/components/layout/ScreenContainer';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { BackHeader } from '@/components/navigation/CustomHeader';
import VerticalList from '@/components/ui/VerticalList';

function AllBHScreen() {
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
    {
      id: 5,
      name: 'Modern Studio',
      price: '4,000,000',
      detail: 'Thủ Đức, TP.HCM',
      rating: 4.8,
      img: 'https://picsum.photos/403/200',
      updatedAt: new Date().toISOString(),
      isFavorite: true,
    },
    {
      id: 6,
      name: 'Modern Studio',
      price: '4,000,000',
      detail: 'Thủ Đức, TP.HCM',
      rating: 4.8,
      img: 'https://picsum.photos/403/200',
      updatedAt: new Date().toISOString(),
      isFavorite: true,
    },
    {
      id: 7,
      name: 'Modern Studio',
      price: '4,000,000',
      detail: 'Thủ Đức, TP.HCM',
      rating: 4.8,
      img: 'https://picsum.photos/403/200',
      updatedAt: new Date().toISOString(),
      isFavorite: true,
    },
    {
      id: 8,
      name: 'Modern Studio',
      price: '4,000,000',
      detail: 'Thủ Đức, TP.HCM',
      rating: 4.8,
      img: 'https://picsum.photos/403/200',
      updatedAt: new Date().toISOString(),
      isFavorite: true,
    },
    {
      id: 9,
      name: 'Modern Studio',
      price: '4,000,000',
      detail: 'Thủ Đức, TP.HCM',
      rating: 4.8,
      img: 'https://picsum.photos/403/200',
      updatedAt: new Date().toISOString(),
      isFavorite: true,
    },
    {
      id: 10,
      name: 'Modern Studio',
      price: '4,000,000',
      detail: 'Thủ Đức, TP.HCM',
      rating: 4.8,
      img: 'https://picsum.photos/403/200',
      updatedAt: new Date().toISOString(),
      isFavorite: true,
    },
  ];

  return (
    <ScreenContainer className={themedClasses.bg} withPadding={false}>
      <BackHeader title="All Boarding House" />
      <View className="px-4">
        <VerticalList data={mockData} />
      </View>
    </ScreenContainer>
  );
}

export default AllBHScreen;
