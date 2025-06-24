import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Badge } from 'react-native-paper';
import { useRouter } from 'expo-router';

const ReportCard = ({ report }) => {
  const router = useRouter();

  const getTargetName = () => {
    return report.target || 'Unknown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#facc15'; // yellow
      case 'resolved':
        return '#10b981'; // green
      case 'rejected':
        return '#ef4444'; // red
      default:
        return '#9ca3af'; // gray
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        {/* Status badge */}
        <View style={styles.header}>
          <Text style={styles.title}>Report Information</Text>
          <Badge
            style={[
              styles.status,
              { backgroundColor: getStatusColor(report.status) },
            ]}
          >
            {report.status?.toUpperCase()}
          </Badge>
        </View>

        {/* Info rows */}
        <View style={styles.row}>
          <Text style={styles.label}>Report Type:</Text>
          <Text style={styles.value}>{report.reportType}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Target:</Text>
          <Text style={styles.value}>{getTargetName()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Reason:</Text>
          <Text style={styles.value}>{report.reason}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Details:</Text>
          <Text style={styles.value}>{report.details}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Created At:</Text>
          <Text style={styles.value}>
            {new Date(report.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Detail link */}
        <Text
          style={styles.viewDetail}
          onPress={() =>
            router.push(`/myreportmanagement/detailReport?id=${report._id}`)
          }
        >
          View Details &gt;
        </Text>
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
    backgroundColor: '#f9fafb',
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
    color: '#111827',
  },
  status: {
    fontSize: 12,
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
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
    color: '#374151',
    fontSize: 14,
  },
  value: {
    flex: 1,
    color: '#1f2937',
    fontSize: 14,
  },
  viewDetail: {
    color: '#3b82f6',
    fontWeight: '500',
    marginTop: 10,
    alignSelf: 'flex-end',
  },
});
