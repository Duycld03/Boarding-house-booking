import React, { useRef, useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { BackHeader } from '@/components/navigation/CustomHeader';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useThemedClasses } from '@/utils/useTheme';
import LoadMoreButton from '@/components/ui/LoadMoreButton';
import ReportCard from '@/components/ui/ReportCard';
import { FontAwesome5 } from '@expo/vector-icons';
import { getMyReport } from '@/API/ownerUser/myReport';
import EmptyState from '@/components/ui/EmptyState';
import Loader from '@/components/ui/Loader';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

function MyReportManagement() {
  const { themedClasses, isDarkMode } = useThemedClasses();
  const [reports, setReports] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [limit, setLimit] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const { t } = useTranslation('myreport');
  const router = useRouter();

  const fetchReports = async (currentLimit = 5) => {
    setIsLoading(true);
    try {
      const res = await getMyReport({ page: 1, limit: currentLimit });
      setReports(res?.data || []);
      setTotalReports(res?.pagination?.totalItems || 0);
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(limit);
  }, [limit]);

  const handleLoadMore = () => {
    setLimit((prev) => prev + 5);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const hasMore = reports.length < totalReports;

  return (
    <ScreenContainer className={themedClasses.bg} withPadding={false}>
      <View
        style={{
          flex: 1,
          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        }}
      >
        <BackHeader
          title={t('title')}
          backIcon={
            <FontAwesome5
              name="chevron-left"
              size={18}
              color={isDarkMode ? '#fff' : '#333'}
            />
          }
        />

        {reports.length === 0 && !isLoading ? (
          <EmptyState title={t('noReports')} message={t('noReportsDesc')} />
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {reports.map((report, index) => (
              <ReportCard key={report._id} report={report} index={index + 1} />
            ))}

            <LoadMoreButton
              hasMore={hasMore}
              isLoading={isLoading}
              onLoadMore={handleLoadMore}
              currentCount={reports.length}
              totalCount={totalReports}
              itemsPerPage={5}
              itemName="reports"
            />
          </ScrollView>
        )}

        {isLoading && <Loader overlay />}
      </View>
    </ScreenContainer>
  );
}

export default MyReportManagement;
