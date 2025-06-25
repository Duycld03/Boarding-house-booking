import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Avatar, Card, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { BackHeader } from '@/components/navigation/CustomHeader';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useThemedClasses } from '@/utils/useTheme';
import { FontAwesome5, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { getOwnReportReviewDetail } from '@/API/reportAPI';
import Loader from '@/components/ui/Loader';
import convertTimetap from '@/utils/convertTimetap';
import { FontAwesome } from '@expo/vector-icons'; // ✅ thêm dòng này

const { width } = Dimensions.get('window');

const DetailReport = () => {
  const { themedClasses, isDarkMode } = useThemedClasses();
  const { t } = useTranslation('myreport');
  const { id } = useLocalSearchParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getOwnReportReviewDetail(id);
        setReportData(res);
      } catch (error) {
        console.error('Error fetching detail report:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  if (loading) return <Loader />;
  if (!reportData)
    return <Text style={{ padding: 20 }}>{t('messages.noData')}</Text>;

  const {
    reporter,
    target,
    reason,
    details,
    images,
    createdAt,
    status,
    reportType,
  } = reportData;

  const colors = {
    primary: isDarkMode ? '#3b82f6' : '#2563eb',
    secondary: isDarkMode ? '#6b7280' : '#9ca3af',
    background: isDarkMode ? '#0f172a' : '#f8fafc',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  const renderInfoItem = (icon, label, value, isStatus = false) => {
    const isReactNode = typeof value !== 'string' && typeof value !== 'number';

    return (
      <View style={styles.infoItem}>
        <View style={styles.infoIcon}>
          {typeof icon === 'string' ? (
            <MaterialIcons name={icon} size={20} color={colors.primary} />
          ) : (
            icon
          )}
        </View>
        <View style={styles.infoContent}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            {label}
          </Text>
          {isReactNode ? (
            <View style={styles.infoValue}>{value}</View>
          ) : (
            <Text style={[styles.infoValueText, { color: colors.text }]}>
              {value}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderStars = (rating = 0) => {
    const fullStars = Math.floor(rating);
    return (
      <View style={styles.starsContainer}>
        <View style={styles.stars}>
          {Array.from({ length: 5 }).map((_, i) => (
            <AntDesign
              key={i}
              name={i < fullStars ? 'star' : 'staro'}
              size={16}
              color="#fbbf24"
            />
          ))}
        </View>
        <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
          ({rating?.toFixed(1) || '0.0'})
        </Text>
      </View>
    );
  };

  const renderStatus = (status) => {
    const statusConfig = {
      pending: { color: colors.warning, icon: 'clock-o' },
      resolved: { color: colors.success, icon: 'check-circle' },
      rejected: { color: colors.error, icon: 'times-circle' },
    };

    const config = statusConfig[status] || {
      color: colors.secondary,
      icon: 'question-circle',
    };

    return (
      <View
        style={[
          styles.statusContainer,
          { backgroundColor: config.color + '15' },
        ]}
      >
        <FontAwesome name={config.icon} size={14} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>
          {t(`status.${status}`)}
        </Text>
      </View>
    );
  };

  const renderUserInfo = (user, title) => {
    return (
      <View style={styles.userSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
        <View style={styles.userCard}>
          <Avatar.Image
            source={{ uri: user?.avatarImage?.url }}
            size={56}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.fullname || t('detail.unknown')}
            </Text>
            <Text style={[styles.userRole, { color: colors.textSecondary }]}>
              {title}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderImageGallery = (imageList, title) => {
    if (!imageList || imageList.length === 0) {
      return (
        <View style={styles.imageSection}>
          <Text style={[styles.imageSectionTitle, { color: colors.text }]}>
            {title}
          </Text>
          <View style={styles.noImagesContainer}>
            <MaterialIcons name="image" size={48} color={colors.secondary} />
            <Text
              style={[styles.noImagesText, { color: colors.textSecondary }]}
            >
              {t('detail.noImages')}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.imageSection}>
        <Text style={[styles.imageSectionTitle, { color: colors.text }]}>
          {title} ({imageList.length})
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageGallery}
        >
          {imageList.map((img, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image
                source={{ uri: img.imageUrl }}
                style={[styles.galleryImage, { borderColor: colors.border }]}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <ScreenContainer className={themedClasses.bg} withPadding={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <BackHeader
          title={t('detail.title')}
          backIcon={
            <FontAwesome5 name="chevron-left" size={18} color={colors.text} />
          }
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Target Info Card */}
          <Card style={[styles.card, { backgroundColor: colors.cardBg }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <MaterialIcons
                  name={reportType === 'review' ? 'rate-review' : 'home-work'}
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {reportType === 'review'
                    ? t('detail.reviewInfo')
                    : t('detail.boardingInfo')}
                </Text>
              </View>

              <Divider
                style={[styles.divider, { backgroundColor: colors.border }]}
              />

              {reportType === 'review' ? (
                <>
                  {renderUserInfo(target?.accountId, t('detail.reviewer'))}
                  {renderInfoItem(
                    <AntDesign name="star" size={20} color="#fbbf24" />,
                    t('detail.rating'),
                    renderStars(target?.rating)
                  )}
                  {renderInfoItem(
                    'message',
                    t('detail.content'),
                    target?.content || t('detail.noContent')
                  )}
                  {renderImageGallery(target?.images, t('detail.images'))}
                </>
              ) : (
                <>
                  {renderInfoItem(
                    'home',
                    t('detail.name'),
                    target?.name || t('detail.unknown')
                  )}
                  {renderInfoItem(
                    'category',
                    t('detail.type'),
                    t(`boardingHouseTypes.${target?.boardingHouseType?.name}`, {
                      defaultValue:
                        target?.boardingHouseType?.name || t('detail.unknown'),
                    })
                  )}
                  {renderInfoItem(
                    <AntDesign name="star" size={20} color="#fbbf24" />,
                    t('detail.rating'),
                    renderStars(target?.rating)
                  )}
                  {renderImageGallery(
                    reportType === 'boardingHouse'
                      ? target?.images?.slice(0, 1)
                      : target?.images,
                    t('detail.images')
                  )}
                </>
              )}
            </Card.Content>
          </Card>

          {/* Report Info Card */}
          <Card style={[styles.card, { backgroundColor: colors.cardBg }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="report" size={24} color={colors.error} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {t('detail.reportInfo')}
                </Text>
              </View>

              <Divider
                style={[styles.divider, { backgroundColor: colors.border }]}
              />

              {renderUserInfo(reporter, t('detail.reporter'))}

              {renderInfoItem(
                'schedule',
                t('detail.reportedAt'),
                convertTimetap(createdAt)
              )}
              {renderInfoItem(
                'info',
                t('myReport.status'),
                renderStatus(status)
              )}
              {renderInfoItem(
                'warning',
                t('myReport.reason'),
                t(`reasons.${reason}`, { defaultValue: reason })
              )}
              {renderInfoItem('description', t('myReport.details'), details)}

              {renderImageGallery(images, t('detail.reportImages'))}
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
};

export default DetailReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    marginBottom: 20,
    height: 1,
  },
  userSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  userAvatar: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingVertical: 4,
  },
  infoIcon: {
    width: 32,
    alignItems: 'center',
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  infoValue: {
    flex: 1,
  },
  infoValueText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  imageSection: {
    marginTop: 12,
  },
  imageSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  imageGallery: {
    paddingRight: 16,
  },
  imageWrapper: {
    marginRight: 12,
  },
  galleryImage: {
    width: 140,
    height: 140,
    borderRadius: 16,
    borderWidth: 1,
  },
  noImagesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(156, 163, 175, 0.2)',
    borderStyle: 'dashed',
  },
  noImagesText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
});
