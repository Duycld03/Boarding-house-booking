import React, { useRef, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { BackHeader } from '@/components/navigation/CustomHeader';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useThemedClasses } from '@/utils/useTheme';
import LoadMoreButton from '@/components/ui/LoadMoreButton';
import ReportCard from '@/components/ui/ReportCard';
import { FontAwesome5 } from '@expo/vector-icons';

const DUMMY_REPORTS = [
  {
    _id: 'r1',
    reportType: 'review',
    target: {
      accountId: { fullname: 'Bùi Minh Nhật' },
    },
    reason: 'Spam',
    details: 'Bài viết chứa nội dung quảng cáo không liên quan.',
    status: 'pending',
    createdAt: '2023-11-15T10:30:00Z',
    images: [
      { imageUrl: 'https://via.placeholder.com/100' },
      { imageUrl: 'https://via.placeholder.com/100' },
    ],
  },
  {
    _id: 'r2',
    reportType: 'boardingHouse',
    target: {
      name: 'Sunshine Boarding House',
    },
    reason: 'False Advertisement',
    details: 'Thông tin về phòng và giá cả không đúng như mô tả.',
    status: 'resolved',
    createdAt: '2023-10-22T09:00:00Z',
    images: [],
  },
  {
    _id: 'r3',
    reportType: 'review',
    target: {
      accountId: { fullname: 'Nguyễn Thị Mai' },
    },
    reason: 'Inappropriate content',
    details: 'Bình luận sử dụng ngôn từ phản cảm.',
    status: 'rejected',
    createdAt: '2023-09-10T13:20:00Z',
    images: [{ imageUrl: 'https://via.placeholder.com/100' }],
  },
  {
    _id: 'r4',
    reportType: 'boardingHouse',
    target: {
      name: 'Green Villa',
    },
    reason: 'Scam on Rent or Deposit',
    details: 'Chủ nhà thu tiền đặt cọc rồi không cho thuê.',
    status: 'pending',
    createdAt: '2023-08-30T08:15:00Z',
    images: [{ imageUrl: 'https://via.placeholder.com/100' }],
  },
  {
    _id: 'r5',
    reportType: 'review',
    target: {
      accountId: { fullname: 'Trần Văn A' },
    },
    reason: 'Privacy violation',
    details: 'Bình luận chứa thông tin cá nhân người khác.',
    status: 'pending',
    createdAt: '2023-08-15T17:45:00Z',
    images: [],
  },
  {
    _id: 'r6',
    reportType: 'boardingHouse',
    target: {
      name: 'Happy Stay',
    },
    reason: 'Poor Security',
    details: 'Khu vực có nhiều trộm cắp, không có camera giám sát.',
    status: 'resolved',
    createdAt: '2023-07-10T11:00:00Z',
    images: [
      { imageUrl: 'https://via.placeholder.com/100' },
      { imageUrl: 'https://via.placeholder.com/100' },
    ],
  },
];

function MyReportManagement() {
  const { themedClasses, isDarkMode } = useThemedClasses();
  const [limit, setLimit] = useState(3);
  const scrollRef = useRef(null);

  const visibleReports = DUMMY_REPORTS.slice(0, limit);
  const hasMore = visibleReports.length < DUMMY_REPORTS.length;

  const handleLoadMore = () => {
    setLimit((prev) => prev + 3);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100); // delay 1 chút cho scroll smooth
  };

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
          {visibleReports.map((report) => (
            <ReportCard key={report._id} report={report} />
          ))}

          <LoadMoreButton
            hasMore={hasMore}
            isLoading={false}
            onLoadMore={handleLoadMore}
            currentCount={visibleReports.length}
            totalCount={DUMMY_REPORTS.length}
            itemsPerPage={3}
            itemName="reports"
          />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

export default MyReportManagement;
