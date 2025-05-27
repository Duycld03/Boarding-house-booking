import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeProvider';
import { useCurrentUser } from '@/context/userContext';
import { formatTimeAgo } from '@/utils/timeUtils';
import truncateDetail from '@/utils/truncateDetail';
import { useTranslation } from 'react-i18next';

const BoardingHouseCard = ({
  id,
  name,
  price,
  detail,
  rating,
  img,
  updatedAt,
  isFavorite: initialFavorite = false,
}) => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const validRating = Number.isFinite(rating) ? Math.round(rating) : 0;
  const { t } = useTranslation('home');

  const timeAgoText = formatTimeAgo(updatedAt);
  const translatedDetail = truncateDetail(
    detail
      ? t(`location.${detail}`, { defaultValue: detail })
      : t('location.No address provided')
  );

  //   const handleFavoriteClick = async () => {
  //     if (isOwner) return;
  //     try {
  //       const response = await addFavorite(id);
  //       if (response && typeof response.isFavorite !== 'undefined') {
  //         setIsFavorite(response.isFavorite);
  //       } else {
  //         Toast.show({ type: 'error', text1: 'Dữ liệu phản hồi không hợp lệ!' });
  //       }
  //     } catch (error) {
  //       navigation.navigate('Login');
  //     }
  //   };

  //   const handleCardPress = () => {
  //     navigation.navigate('BoardingHouseDetail', { id });
  //   };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: isDarkMode ? '#1f2937' : '#fff' },
      ]}
      //   onPress={handleCardPress}
    >
      <Image source={{ uri: img }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text
          style={[styles.name, { color: isDarkMode ? '#fff' : '#000' }]}
          numberOfLines={1}
        >
          {name}
        </Text>

        <View style={styles.rating}>
          {Array.from({ length: validRating }).map((_, i) => (
            <AntDesign key={i} name="star" size={18} color="gold" />
          ))}
        </View>

        <Text style={styles.price}>
          {price} {t('currencyPerMonth')}
        </Text>

        <View style={styles.bottomRow}>
          <Text
            style={[styles.detail, { color: isDarkMode ? '#e5e7eb' : '#333' }]}
            numberOfLines={1}
          >
            {translatedDetail} - {timeAgoText}
          </Text>
          <TouchableOpacity>
            <AntDesign
              name={isFavorite ? 'heart' : 'hearto'}
              size={22}
              color={isFavorite ? 'red' : isDarkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    overflow: 'hidden',
    marginRight: 16, // tạo khoảng cách giữa các card ngang
    width: 160, // cố định chiều ngang cho mỗi card
  },
  image: {
    height: 150,
    width: '100%',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  rating: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f57c00',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detail: {
    flex: 1,
    fontSize: 13,
    marginRight: 8,
  },
});

export default BoardingHouseCard;
