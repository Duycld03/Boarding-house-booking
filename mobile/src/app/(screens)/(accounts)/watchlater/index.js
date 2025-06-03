import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import ListCard from '@/components/ui/ListCard';
import { BackHeader } from '@/components/navigation/CustomHeader';
import { getAllWatchLater, deleteWatchLater } from '@/API/watchLaterManagement';
import { ConfirmModal } from '@/components/feedback';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useThemedClasses } from '@/utils/useTheme';
import LoadMoreButton from '@/components/ui/LoadMoreButton';
import EmptyState from '@/components/ui/EmptyState';
import Loader from '@/components/ui/Loader';

function WatchLater() {
  const [watchList, setWatchList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [pagination, setPagination] = useState({ totalItems: 0 });
  const [currentLimit, setCurrentLimit] = useState(5);

  const router = useRouter();
  const { themedClasses, isDarkMode } = useThemedClasses();
  const { t } = useTranslation('common');

  const fetchWatchList = async (limit = 5) => {
    setLoading(true);
    try {
      const res = await getAllWatchLater({ page: 1, limit });
      setWatchList(res?.data || []);
      setPagination({ totalItems: res?.pagination?.totalItems || 0 });
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteWatchLater(selectedId);
      fetchWatchList(currentLimit);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsOpenDeleteModal(false);
      setSelectedId(null);
    }
  };

  useEffect(() => {
    fetchWatchList(currentLimit);
  }, [currentLimit]);

  const handleLoadMore = () => {
    setCurrentLimit((prev) => prev + 5);
  };

  const hasMore = watchList.length < pagination.totalItems;

  return (
    <ScreenContainer className={themedClasses.bg} withPadding={false}>
      <View
        style={{ flex: 1, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }}
      >
        <BackHeader title={t('watchLater')} />

        {watchList.length === 0 && !loading ? (
          <EmptyState
            title={t('noWatchLater')}
            message={
              t('noWatchLaterDesc') || 'You have no saved items to watch later.'
            }
          />
        ) : (
          <>
            <ListCard
              data={watchList}
              onConfirmDelete={() => setIsOpenDeleteModal(true)}
              setSelectedId={setSelectedId}
              mode="watchLater"
            />
            <LoadMoreButton
              hasMore={hasMore}
              currentCount={watchList.length}
              totalCount={pagination.totalItems}
              itemsPerPage={5}
              isLoading={loading}
              onLoadMore={handleLoadMore}
              itemName="boarding houses"
            />
          </>
        )}

        {loading && <Loader overlay />}

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
    </ScreenContainer>
  );
}

export default WatchLater;
