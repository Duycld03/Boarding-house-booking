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

function MyReportManagement() {
  const { themedClasses, isDarkMode } = useThemedClasses();
  const [reports, setReports] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [limit, setLimit] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const res = await getMyReport({ page: 1, limit });
        setReports(res?.data || []);
        setTotalReports(res?.pagination?.totalItems || 0);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
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
          title="My Reports"
          backIcon={
            <FontAwesome5
              name="chevron-left"
              size={18}
              color={isDarkMode ? '#fff' : '#333'}
            />
          }
        />

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {reports.map((report) => (
            <ReportCard key={report._id} report={report} />
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
      </View>
    </ScreenContainer>
  );
}

export default MyReportManagement;
