import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import ListCard from '@/components/ui/ListCard';
import { BackHeader } from '@/components/navigation/CustomHeader';
import { getAllWatchLater, deleteWatchLater } from '@/API/watchLaterManagement';
import { ConfirmModal } from '@/components/feedback';
import { useTheme } from '@/context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

function WatchLater() {
  const [watchList, setWatchList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation('common');

  const fetchWatchList = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAllWatchLater({ page, limit: 8 });
      setWatchList(res?.data || []);
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
      await deleteWatchLater(selectedId);
      fetchWatchList(pagination.currentPage);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsOpenDeleteModal(false);
      setSelectedId(null);
    }
  };

  useEffect(() => {
    fetchWatchList();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: 16,
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
      }}
    >
      <BackHeader title={t('watchLater')} />
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
        <ListCard
          data={watchList}
          onConfirmDelete={handleConfirmDelete}
          setSelectedId={setSelectedId}
          mode="watchLater"
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(page) => fetchWatchList(page)}
        />
      )}

      <ConfirmModal
        visible={isOpenDeleteModal}
        title={t('confirmDeletion')}
        message={t('confirmRemoveWatchLater')}
        onConfirm={handleDelete}
        onClose={() => {
          setIsOpenDeleteModal(false);
          setSelectedId(null);
        }}
      />
    </View>
  );
}

export default WatchLater;
