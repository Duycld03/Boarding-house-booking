import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import ListCard from '@/components/ui/ListCard';
import { BackHeader } from '@/components/navigation/CustomHeader';
import { getAllFavorites, deleteFavorite } from '@/API/favoriteManagement';
import { ConfirmModal } from '@/components/feedback';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useTranslation } from 'react-i18next'; // ✅ i18n

function Favorite() {
  const [favorites, setFavorites] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation('common'); // ✅ i18n

  const fetchFavorites = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAllFavorites({ page, limit: 8 });
      setFavorites(res?.data || []);
      setPagination({
        currentPage: res?.pagination?.currentPage || 1,
        totalPages: res?.pagination?.totalPages || 1,
      });
    } catch (error) {
      setLoading(false);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = () => {
    setIsOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteFavorite(selectedId);
      fetchFavorites(pagination.currentPage);
    } catch (error) {
      console.error('Delete failed', error);
    } finally {
      setIsOpenDeleteModal(false);
      setSelectedId(null);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: 16,
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
      }}
    >
      <BackHeader title={t('favorites')} />
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
        <ListCard
          data={favorites}
          onConfirmDelete={handleConfirmDelete}
          setSelectedId={setSelectedId}
          mode="favorite"
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(page) => fetchFavorites(page)}
        />
      )}

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
  );
}

export default Favorite;
