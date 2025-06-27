import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { formatTimeAgo } from '@/utils/timeUtils';
import truncateDetail from '@/utils/truncateDetail';
import { useTranslation } from 'react-i18next';
import { addFavorite, getFavorite } from '@/API/favoriteAPI';
import emitter from '@/utils/FavoriteEvent';
import formatAmount from '@/utils/formatAmount';
import i18next from 'i18next';

const BoardingHouseCard = ({
  id,
  name,
  price,
  detail,
  rating,
  img,
  updatedAt,
}) => {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false); // khởi đầu false
  const { t } = useTranslation('home');
  const validRating = Number.isFinite(rating) ? Math.round(rating) : 0;
  const currentLanguage = i18next.language;

  const timeAgoText = formatTimeAgo(updatedAt, t);
  const translatedDetail = truncateDetail(
    detail
      ? t(`location.${detail}`, { defaultValue: detail })
      : t('location.No address provided')
  );

  // Khi mount, gọi API lấy danh sách favorite để biết item này có được yêu thích chưa
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const response = await getFavorite();
        if (response && Array.isArray(response.favorites)) {
          const favoriteIds = response.favorites.map((fav) => fav.id);
          setIsFavorite(favoriteIds.includes(id));
        }
      } catch (error) {}
    };
    fetchFavoriteStatus();
  }, [id]);
  useEffect(() => {
    const handler = ({ id: changedId, isFavorite }) => {
      if (changedId === id) {
        setIsFavorite(isFavorite);
      }
    };

    emitter.on('favoriteChanged', handler);
    return () => {
      emitter.off('favoriteChanged', handler);
    };
  }, [id]);

  // Hàm toggle favorite khi bấm icon
  const handleFavoriteClick = async () => {
    try {
      const response = await addFavorite(id);
      if (response && typeof response.isFavorite !== 'undefined') {
        setIsFavorite(response.isFavorite);

        emitter.emit('favoriteChanged', {
          id: String(id),
          isFavorite: response.isFavorite,
        });
      }
    } catch (error) {
      router.push('/login');
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode ? '#1f2937' : '#fff',
          shadowColor: isDarkMode ? '#000' : '#aaa',
        },
      ]}
      onPress={() => router.push(`/BhDetail/${id}`)}
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
          {formatAmount(price, currentLanguage)} {t('currencyPerMonth')}{' '}
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

          <TouchableOpacity
            onPress={handleFavoriteClick}
            style={styles.heartIcon}
          >
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
    minHeight: 250,
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
    alignItems: 'center', // căn giữa theo chiều dọc để heart và timeAgo nằm cùng hàng
    marginTop: -2,
  },
  detailContainer: {
    flex: 1,
    marginRight: 6,
    flexDirection: 'column',
  },
  detail: {
    fontSize: 13,
  },
  timeAgo: {
    fontSize: 12,
    marginTop: 2,
  },
  heartIcon: {
    // Optional: can add some marginLeft để tách icon ra khỏi text
    marginLeft: 8,
    marginTop: 8,
  },
});

export default BoardingHouseCard;
