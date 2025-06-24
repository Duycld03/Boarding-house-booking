import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { Avatar, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { BackHeader } from '@/components/navigation/CustomHeader';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useThemedClasses } from '@/utils/useTheme';
import { FontAwesome5, AntDesign } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { getOwnReportReviewDetail } from '@/API/reportAPI';
import Loader from '@/components/ui/Loader';
import convertTimetap from '@/utils/convertTimetap';

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
  const textColor = { color: isDarkMode ? '#fff' : '#000' };

  const renderLabelValue = (label, value) => {
    const isReactNode = typeof value !== 'string' && typeof value !== 'number';
    return isReactNode ? (
      <View style={styles.labelRow}>
        <Text style={styles.labelBold}>{label}:</Text>
        <View style={{ marginLeft: 8 }}>{value}</View>
      </View>
    ) : (
      <View style={styles.labelRow}>
        <Text style={[styles.labelBold, textColor]}>{label}:</Text>
        <Text style={[styles.value, textColor]}>{value}</Text>
      </View>
    );
  };

  const renderStars = (rating = 0) => {
    const fullStars = Math.floor(rating);
    return (
      <View style={styles.stars}>
        {Array.from({ length: 5 }).map((_, i) => (
          <AntDesign
            key={i}
            name={i < fullStars ? 'star' : 'staro'}
            size={16}
            color="#facc15"
          />
        ))}
      </View>
    );
  };

  const renderStatus = (status) => {
    const colors = {
      pending: '#facc15',
      resolved: '#10b981',
      rejected: '#ef4444',
    };
    return (
      <View
        style={[
          styles.statusTag,
          { backgroundColor: colors[status] || '#9ca3af' },
        ]}
      >
        <Text style={{ color: '#fff', fontSize: 13 }}>
          {t(`status.${status}`)}
        </Text>
      </View>
    );
  };

  return (
    <ScreenContainer className={themedClasses.bg} withPadding={false}>
      <View
        style={{ flex: 1, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }}
      >
        <BackHeader
          title={t('detail.title')}
          backIcon={
            <FontAwesome5
              name="chevron-left"
              size={18}
              color={isDarkMode ? '#fff' : '#333'}
            />
          }
        />

        {/* Section 1 */}
        <Card
          style={[
            styles.card,
            { backgroundColor: isDarkMode ? '#1f2937' : '#fff' },
          ]}
        >
          <Card.Content>
            <Text style={[styles.sectionTitle, textColor]}>
              {reportType === 'review'
                ? t('detail.reviewInfo')
                : t('detail.boardingInfo')}
            </Text>

            {reportType === 'review' ? (
              <>
                <View style={styles.row}>
                  <Avatar.Image
                    source={{ uri: target?.accountId?.avatarImage?.url }}
                    size={50}
                  />
                  <Text style={[styles.text, textColor]}>
                    {target?.accountId?.fullname || t('detail.unknown')}
                  </Text>
                </View>
                {renderLabelValue(
                  t('detail.rating'),
                  renderStars(target?.rating)
                )}
                {renderLabelValue(
                  t('detail.content'),
                  target?.content || t('detail.noContent')
                )}
              </>
            ) : (
              <>
                {renderLabelValue(
                  t('detail.name'),
                  target?.name || t('detail.unknown')
                )}
                {renderLabelValue(
                  t('detail.type'),
                  t(`boardingHouseTypes.${target?.boardingHouseType?.name}`, {
                    defaultValue:
                      target?.boardingHouseType?.name || t('detail.unknown'),
                  })
                )}
                {renderLabelValue(
                  t('detail.rating'),
                  renderStars(target?.rating)
                )}
              </>
            )}

            <Text style={[styles.subTitle, textColor]}>
              {t('detail.images')}:
            </Text>

            {reportType === 'review' ? (
              <ScrollView horizontal>
                {target?.images?.length > 0 ? (
                  target.images.map((img, index) => (
                    <Image
                      key={index}
                      source={{ uri: img.imageUrl }}
                      style={styles.image}
                    />
                  ))
                ) : (
                  <Text style={textColor}>{t('detail.noImages')}</Text>
                )}
              </ScrollView>
            ) : (
              <>
                {target?.images?.[0]?.imageUrl ? (
                  <Image
                    source={{ uri: target.images[0].imageUrl }}
                    style={[styles.image, { marginBottom: 8 }]}
                  />
                ) : (
                  <Text style={textColor}>{t('detail.noImages')}</Text>
                )}
              </>
            )}
          </Card.Content>
        </Card>

        {/* Section 2 */}
        <Card
          style={[
            styles.card,
            { backgroundColor: isDarkMode ? '#1f2937' : '#fff' },
          ]}
        >
          <Card.Content>
            <Text style={[styles.sectionTitle, textColor]}>
              {t('detail.reportInfo')}
            </Text>

            <View style={styles.row}>
              <Avatar.Image
                source={{ uri: reporter?.avatarImage?.url }}
                size={50}
              />
              <Text style={[styles.text, textColor]}>
                {reporter?.fullname || t('detail.unknown')}
              </Text>
            </View>

            {renderLabelValue(
              t('detail.reportedAt'),
              convertTimetap(createdAt)
            )}

            {renderLabelValue(t('myReport.status'), renderStatus(status))}
            {renderLabelValue(
              t('myReport.reason'),
              t(`reasons.${reason}`, { defaultValue: reason })
            )}
            {renderLabelValue(t('myReport.details'), details)}

            <Text style={[styles.subTitle, textColor]}>
              {t('detail.reportImages')}:
            </Text>

            <View style={{ width: '100%' }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: 'row' }}
              >
                {images?.length > 0 ? (
                  images.map((img, index) => (
                    <Image
                      key={index}
                      source={{ uri: img.imageUrl }}
                      style={styles.image}
                    />
                  ))
                ) : (
                  <Text style={textColor}>{t('detail.noImages')}</Text>
                )}
              </ScrollView>
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScreenContainer>
  );
};

export default DetailReport;

const styles = StyleSheet.create({
  card: {
    margin: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
  },
  label: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  labelBold: {
    fontWeight: 'bold',
  },
  value: {
    fontWeight: 'normal',
    marginLeft: 4,
  },
  subTitle: {
    fontWeight: 'bold',
    // marginTop: 10,
    marginBottom: 4,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
    resizeMode: 'cover',
  },
  stars: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statusTag: {
    paddingHorizontal: 14,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'nowrap',
  },
});
