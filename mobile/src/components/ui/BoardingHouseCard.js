import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // <-- thay useNavigation bằng useRouter
import { useTheme } from '@/context/ThemeProvider';
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
  const router = useRouter(); // <-- dùng useRouter của expo-router
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const validRating = Number.isFinite(rating) ? Math.round(rating) : 0;
  const { t } = useTranslation('home');

  const timeAgoText = formatTimeAgo(updatedAt, t);
  const translatedDetail = truncateDetail(
    detail
      ? t(`location.${detail}`, { defaultValue: detail })
      : t('location.No address provided')
  );

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode ? '#1f2937' : '#fff',
          shadowColor: isDarkMode ? '#000' : '#aaa',
        },
      ]}
      onPress={() =>
        router.push({
          pathname: '/(screens)/BhDetail',
          params: { id },
        })
      }
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
            <AntDesign key={i} name="star" size={16} color="#facc15" />
          ))}
        </View>

        <Text style={styles.price}>
          {price} {t('currencyPerMonth')}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.detailContainer}>
            <Text
              style={[
                styles.detail,
                { color: isDarkMode ? '#d1d5db' : '#333' },
              ]}
              numberOfLines={1}
            >
              {translatedDetail}
            </Text>
            <Text
              style={[
                styles.timeAgo,
                { color: isDarkMode ? '#9ca3af' : '#777' },
              ]}
              numberOfLines={1}
            >
              {timeAgoText}
            </Text>
          </View>

          <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
            <AntDesign
              name={isFavorite ? 'heart' : 'hearto'}
              size={20}
              color={isFavorite ? 'red' : isDarkMode ? '#fff' : '#444'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
    width: 165,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 260,
  },
  image: {
    height: 120,
    width: '100%',
  },
  content: {
    padding: 10,
    gap: 6,
    paddingBottom: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  rating: {
    flexDirection: 'row',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f57c00',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginTop: 4,
  },
  detailContainer: {
    flex: 1,
    marginRight: 6,
  },
  detail: {
    fontSize: 13,
  },
  timeAgo: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default BoardingHouseCard;
