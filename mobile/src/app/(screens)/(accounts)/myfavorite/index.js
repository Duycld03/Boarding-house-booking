import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import ListCard from '@/components/ui/ListCard';
import { BackHeader } from '@/components/navigation/CustomHeader';
import { getAllFavorites, deleteFavorite } from '@/API/favoriteManagement';
import { ConfirmModal } from '@/components/feedback';
import { useRouter } from 'expo-router';
import { useThemedClasses } from '@/utils/useTheme';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@/components/layout/ScreenContainer';
import LoadMoreButton from '@/components/ui/LoadMoreButton';
import EmptyState from '@/components/ui/EmptyState';
import Loader from '@/components/ui/Loader';
import {
  Ionicons,
  MaterialIcons,
  AntDesign,
  FontAwesome,
  FontAwesome5,
} from '@expo/vector-icons';

function Favorite() {
  const [favorites, setFavorites] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(5);

  const router = useRouter();
  const { themedClasses, isDarkMode } = useThemedClasses();
  const { t } = useTranslation('common');

  const fetchFavorites = async (currentLimit = 5) => {
    setLoading(true);
    try {
      const res = await getAllFavorites({ page: 1, limit: currentLimit });
      setFavorites(res?.data || []);
      setTotalItems(res?.pagination?.totalItems || 0);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setLimit((prev) => prev + 5);
  };

  const handleDelete = async () => {
    try {
      await deleteFavorite(selectedId);
      fetchFavorites(limit);
    } catch (error) {
      console.error('Delete failed', error);
    } finally {
      setIsOpenDeleteModal(false);
      setSelectedId(null);
    }
  };

  useEffect(() => {
    fetchFavorites(limit);
  }, [limit]);

  const hasMore = favorites.length < totalItems;

  return (
    <ScreenContainer className={themedClasses.bg} withPadding={false}>
      <View
        style={{
          flex: 1,
          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        }}
      >
        <BackHeader
          backIcon={
            <FontAwesome5
              name="chevron-left"
              size={18}
              color={isDarkMode ? '#fff' : '#333'}
            />
          }
          title={t('favorites')}
        />

        {favorites.length === 0 && !loading ? (
          <EmptyState
            title={t('noFavorites')}
            message={
              t('noFavoritesDesc') || 'You have not added any favorites yet.'
            }
          />
        ) : (
          <>
            <ListCard
              data={favorites}
              onConfirmDelete={() => setIsOpenDeleteModal(true)}
              setSelectedId={setSelectedId}
              mode="favorite"
            />
            <LoadMoreButton
              hasMore={hasMore}
              isLoading={loading}
              onLoadMore={handleLoadMore}
              currentCount={favorites.length}
              totalCount={totalItems}
              itemsPerPage={5}
              itemName="boarding houses"
            />
          </>
        )}

        {loading && <Loader overlay />}

        <ConfirmModal
          visible={isOpenDeleteModal}
          title={t('confirmDeletion')}
          message={t('confirmRemoveFavorite')}
          onConfirm={handleDelete}
          onClose={() => {
            setIsOpenDeleteModal(false);
            setSelectedId(null);
          }}
        />
      </View>
    </ScreenContainer>
  );
}

export default Favorite;
