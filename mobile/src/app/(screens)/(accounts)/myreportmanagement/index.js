import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { BackHeader } from '@/components/navigation/CustomHeader';
import { Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useThemedClasses } from '@/utils/useTheme';
import {
  Ionicons,
  MaterialIcons,
  AntDesign,
  FontAwesome,
  FontAwesome5,
} from '@expo/vector-icons';

const MyReportManagement = () => {
  const router = useRouter();
  const { themedClasses, isDarkMode } = useThemedClasses();

  const report = {
    reporterName: 'Alice Johnson',
    createdAt: '2023-11-15',
    status: 'pending',
    content:
      'The boarding house was generally clean and the location was convenient. However, there were',
    images: [
      'https://via.placeholder.com/100',
      'https://via.placeholder.com/100',
      'https://via.placeholder.com/100',
    ],
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
          backIcon={
            <FontAwesome5
              name="chevron-left"
              size={18}
              color={isDarkMode ? '#fff' : '#333'}
            />
          }
          title="Report Management"
        />
        <Card style={styles.card}>
          <Card.Content>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.row}>
                <Avatar.Image
                  source={{
                    uri: 'https://randomuser.me/api/portraits/women/1.jpg',
                  }}
                  size={40}
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.name}>{report.reporterName}</Text>
                  <Text style={styles.date}>{report.createdAt}</Text>
                </View>
              </View>
              <View>
                <Text style={styles.status}>
                  {report.status === 'pending' ? 'Pending' : report.status}
                </Text>
              </View>
            </View>
            <Text style={styles.content} numberOfLines={2}>
              {report.content}
            </Text>
            <View style={styles.imageRow}>
              {report.images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </View>
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
      </View>
    </ScreenContainer>
  );
};

export default MyReportManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    margin: 16,
    borderRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontWeight: '600',
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  status: {
    backgroundColor: '#f59e0b',
    color: 'white',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    fontSize: 14,
    marginBottom: 8,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 8,
  },
  viewDetail: {
    color: '#3b82f6',
    fontWeight: '500',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});
