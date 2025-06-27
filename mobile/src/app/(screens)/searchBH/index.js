import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/layout/ScreenContainer';
import VerticalList from '@/components/ui/VerticalList';
import LoadMoreButton from '@/components/ui/LoadMoreButton';
import { useThemedClasses } from '@/utils/useTheme';
import { useTheme } from '@/context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import useDebounce from '@/utils/useDebounce';
import { searchBoardingHouses } from '@/API/boardingHouseAPI';
import formatAmount from '@/utils/formatAmount';
import { BackHeader } from '@/components/navigation/CustomHeader';
import EmptyState from '@/components/ui/EmptyState';
import Loader from '@/components/ui/Loader';

function SearchScreen() {
  const { themedClasses, isDarkMode } = useThemedClasses();
  const { theme } = useTheme();
  const { t } = useTranslation('home');
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 6;

  const fetchSearchResults = async (term, currentPage = 1) => {
    if (currentPage === 1) setInitialLoading(true);
    setLoading(true);
    try {
      const res = await searchBoardingHouses(
        term?.trim() ? { name: term.trim() } : {},
        { page: currentPage, limit }
      );

      const newData =
        res?.data?.map((item) => ({
          id: item._id,
          name: item.name,
          price: item.priceRange,
          detail: item.address?.province,
          rating: item.rating || 0,
          reviewCount: item.reviewCount || 0,
          img:
            item.images?.find((img) => img.isPrimary)?.imageUrl ||
            item.images?.[0]?.imageUrl ||
            '',
          updatedAt: item.updatedAt || 0,
        })) || [];

      if (currentPage === 1) {
        setData(newData);
      } else {
        setData((prev) => [...prev, ...newData]);
      }

      setTotalItems(res?.pagination?.totalItems || newData.length);
    } catch (error) {
      console.error('Search failed:', error);
      setData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
      if (currentPage === 1) setInitialLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchSearchResults(debouncedSearch, 1);
  }, [debouncedSearch]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    if (data.length < totalItems && !loading) {
      setPage(nextPage);
      fetchSearchResults(debouncedSearch, nextPage);
    }
  };

  const hasMore = data.length < totalItems;

  return (
    <ScreenContainer className={themedClasses.bg} withPadding={false}>
      {initialLoading ? (
        <Loader overlay />
      ) : (
        <>
          <BackHeader title={t('search', 'Tìm kiếm')} />
          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchBar,
                { backgroundColor: isDarkMode ? '#374151' : '#ffffff' },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={20}
                color={isDarkMode ? '#9ca3af' : '#6b7280'}
              />
              <TextInput
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder={t('searchPlaceholder', 'Tìm kiếm nhà trọ...')}
                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                style={[styles.input, { color: isDarkMode ? '#fff' : '#000' }]}
              />
              <TouchableOpacity onPress={() => router.push('/explore')}>
                <Ionicons
                  name="filter-outline"
                  size={20}
                  color={isDarkMode ? '#9ca3af' : '#6b7280'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            {data.length === 0 && !loading ? (
              <EmptyState
                title={t('noResult', 'Không tìm thấy')}
                message={t(
                  'noResultDesc',
                  'Không có nhà trọ nào phù hợp với tìm kiếm của bạn.'
                )}
              />
            ) : (
              <>
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
              </>
            )}
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 3,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
});

export default SearchScreen;
