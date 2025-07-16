import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Badge, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeProvider';
import convertTimetap from '@/utils/convertTimetap';

const ReportCard = ({ report, index }) => {
  const router = useRouter();
  const { t } = useTranslation('myreport');
  const { isDarkMode } = useTheme();

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#facc15';
      case 'resolved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  };

  return (
    <Card
      style={[
        styles.card,
        { backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb' },
      ]}
    >
      <Card.Content>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: isDarkMode ? '#f9fafb' : '#111827' },
            ]}
          >
            {index}. {t('detail.reportInfo')}
          </Text>
          <Badge
            style={[
              styles.status,
              { backgroundColor: getStatusColor(report.status) },
            ]}
          >
            {t(`status.${report.status}`)}
          </Badge>
        </View>

        {[
          ['reportType', report.reportType],
          ['target', report.target || t('detail.unknown')],
          [
            'reason',
            t(`reasons.${report.reason}`, { defaultValue: report.reason }),
          ],
          ['details', report.details],
          ['createdAt', convertTimetap(report.createdAt)],
        ].map(([labelKey, value]) => (
          <View style={styles.row} key={labelKey}>
            <Text
              style={[
                styles.label,
                { color: isDarkMode ? '#e5e7eb' : '#374151' },
              ]}
            >
              {t(`myReport.${labelKey}`)}:
            </Text>
            <Text
              style={[
                styles.value,
                { color: isDarkMode ? '#f3f4f6' : '#1f2937' },
              ]}
            >
              {value}
            </Text>
          </View>
        ))}

        <Button
          mode="contained"
          onPress={() =>
            router.push(`/myreportmanagement/detailReport?id=${report._id}`)
          }
          style={styles.detailButton}
          labelStyle={{ color: '#fff' }}
          buttonColor={isDarkMode ? '#2563eb' : '#3b82f6'}
        >
          {t('myReport.detail')}
        </Button>
      </Card.Content>
    </Card>
  );
};

export default ReportCard;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    color: '#fff',
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: 100,
    fontWeight: '600',
    fontSize: 14,
  },
  value: {
    flex: 1,
    fontSize: 14,
  },
  detailButton: {
    marginTop: 16,
    borderRadius: 8,
  },
});
