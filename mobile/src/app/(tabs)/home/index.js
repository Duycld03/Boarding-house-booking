import React, { useState, useCallback } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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

const { width } = Dimensions.get('window');

function Home() {
  const { themedClasses, isDarkMode } = useThemedClasses();
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

  // Header Component với gradient và animation
  const Header = () => (
    <LinearGradient
      colors={isDarkMode ? ['#1e293b', '#334155'] : ['#0ea5e9', '#0284c7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View>
          <Text style={[styles.greeting, { color: '#ffffff' }]}>
            {t('greeting', 'Xin chào!')}
          </Text>
          <Text style={[styles.welcomeText, { color: '#e0f2fe' }]}>
            {t('welcome')}
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#ffffff" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  // Search Bar Component
  const SearchBar = () => (
    <View style={styles.searchContainer}>
      <TouchableOpacity
        style={[
          styles.searchBar,
          { backgroundColor: isDarkMode ? '#374151' : '#ffffff' },
        ]}
        onPress={() => router.push('/explore')}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={isDarkMode ? '#9ca3af' : '#6b7280'}
        />
        <Text
          style={[
            styles.searchPlaceholder,
            { color: isDarkMode ? '#9ca3af' : '#6b7280' },
          ]}
        >
          {t('welcome')}
        </Text>
        <Ionicons
          name="filter-outline"
          size={20}
          color={isDarkMode ? '#9ca3af' : '#6b7280'}
        />
      </TouchableOpacity>
    </View>
  );

  // Stats Cards Component
  const StatsCards = () => (
    <View style={styles.statsContainer}>
      <View
        style={[
          styles.statsCard,
          { backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' },
        ]}
      >
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.statsIconContainer}
        >
          <Ionicons name="home-outline" size={20} color="#ffffff" />
        </LinearGradient>
        <Text
          style={[
            styles.statsNumber,
            { color: isDarkMode ? '#ffffff' : '#1f2937' },
          ]}
        >
          {data.length}
        </Text>
        <Text
          style={[
            styles.statsLabel,
            { color: isDarkMode ? '#9ca3af' : '#6b7280' },
          ]}
        >
          {t('All')}
        </Text>
      </View>

      <View
        style={[
          styles.statsCard,
          { backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' },
        ]}
      >
        <LinearGradient
          colors={['#f59e0b', '#d97706']}
          style={styles.statsIconContainer}
        >
          <Ionicons name="star-outline" size={20} color="#ffffff" />
        </LinearGradient>
        <Text
          style={[
            styles.statsNumber,
            { color: isDarkMode ? '#ffffff' : '#1f2937' },
          ]}
        >
          {highRatingData.length}
        </Text>
        <Text
          style={[
            styles.statsLabel,
            { color: isDarkMode ? '#9ca3af' : '#6b7280' },
          ]}
        >
          {t('rating')}
        </Text>
      </View>

      <View
        style={[
          styles.statsCard,
          { backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' },
        ]}
      >
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed']}
          style={styles.statsIconContainer}
        >
          <Ionicons name="time-outline" size={20} color="#ffffff" />
        </LinearGradient>
        <Text
          style={[
            styles.statsNumber,
            { color: isDarkMode ? '#ffffff' : '#1f2937' },
          ]}
        >
          {newestData.length}
        </Text>
        <Text
          style={[
            styles.statsLabel,
            { color: isDarkMode ? '#9ca3af' : '#6b7280' },
          ]}
        >
          {t('newest', 'Mới nhất')}
        </Text>
      </View>
    </View>
  );

  // Enhanced Section Header
  const SectionHeader = ({ title, link, icon, gradient }) => (
    <View style={styles.sectionHeaderContainer}>
      <View style={styles.sectionHeaderLeft}>
        <LinearGradient colors={gradient} style={styles.sectionIcon}>
          <Ionicons name={icon} size={18} color="#ffffff" />
        </LinearGradient>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDarkMode ? '#ffffff' : '#1f2937' },
          ]}
        >
          {title}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.seeMoreButton}
        onPress={() => router.push(link)}
      >
        <Text style={styles.seeMoreText}>{t('seeMore', 'Xem thêm')}</Text>
        <Ionicons name="chevron-forward" size={16} color="#0ea5e9" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDarkMode ? '#111827' : '#f8fafc' },
        ]}
      >
        <Loader
          color={isDarkMode ? '#3B82F6' : '#1D4ED8'}
          textColor={isDarkMode ? '#e0f2fe' : '#1f2937'}
        />
      </View>
    );
  }

  return (
    <ScreenContainer className={themedClasses.bg} withPadding={false}>
      <ScrollContainer keyboardAvoiding showsVerticalScrollIndicator={false}>
        <Header />
        <SearchBar />
        <StatsCards />

        <View style={styles.sectionsContainer}>
          <SectionHeader
            title={t('All', 'Tất cả')}
            link="/allBH"
            icon="grid-outline"
            gradient={['#06b6d4', '#0891b2']}
          />
          <HorizontalList data={data} />

          <SectionHeader
            title={t('newest', 'Mới nhất')}
            link="/newestBH"
            icon="sparkles-outline"
            gradient={['#8b5cf6', '#7c3aed']}
          />
          <HorizontalList data={newestData} />

          <SectionHeader
            title={t('rating', 'Đánh giá cao')}
            link="/highRatingBH"
            icon="trophy-outline"
            gradient={['#f59e0b', '#d97706']}
          />
          <HorizontalList data={highRatingData} />
        </View>
      </ScrollContainer>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    opacity: 0.9,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionsContainer: {
    paddingHorizontal: 20,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0ea5e9',
    marginRight: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
