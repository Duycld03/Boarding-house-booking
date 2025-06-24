import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { Avatar, Card, Badge } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { BackHeader } from '@/components/navigation/CustomHeader';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useThemedClasses } from '@/utils/useTheme';
import { FontAwesome5, AntDesign } from '@expo/vector-icons';

const DetailReport = () => {
  const { themedClasses, isDarkMode } = useThemedClasses();
  const { t } = useTranslation('myreport');

  const reportData = {
    reportType: 'review',
    target: {
      accountId: {
        fullname: 'Nguyễn Văn A',
        avatarImage: { url: 'https://randomuser.me/api/portraits/men/1.jpg' },
      },
      rating: 4,
      content: 'Chất lượng kém, không giống mô tả.',
      images: [{ imageUrl: 'https://via.placeholder.com/150' }],
    },
    reporter: {
      fullname: 'Trần Thị B',
      avatarImage: { url: '' },
    },
    reason: 'Privacy violation',
    details: 'Bình luận tiết lộ thông tin cá nhân.',
    createdAt: '2025-06-24T07:27:44.008Z',
    status: 'resolved',
    images: [{ imageUrl: 'https://via.placeholder.com/150' }],
  };

  const { reporter, target, reason, details, images, createdAt, status } =
    reportData;

  const textColor = { color: isDarkMode ? '#fff' : '#000' };

  const renderLabelValue = (label: string, value: string | React.ReactNode) => {
    const isReactNode = typeof value !== 'string' && typeof value !== 'number';

    if (isReactNode) {
      return (
        <View style={[styles.labelRow]}>
          <Text style={styles.labelBold}>{label}:</Text>
          <View style={{ marginLeft: 8 }}>{value}</View>
        </View>
      );
    }

    return (
      <Text style={[styles.label, textColor]}>
        <Text style={styles.labelBold}>{label}: </Text>
        <Text style={styles.value}>{value}</Text>
      </Text>
    );
  };

  const renderStars = (rating = 0) => {
    const fullStars = Math.floor(rating);
    const maxStars = 5;
    return (
      <View style={styles.stars}>
        {Array.from({ length: maxStars }).map((_, i) =>
          i < fullStars ? (
            <AntDesign key={i} name="star" size={16} color="#facc15" />
          ) : (
            <AntDesign key={i} name="staro" size={16} color="#facc15" />
          )
        )}
      </View>
    );
  };

  const renderStatus = (status: string) => {
    let backgroundColor = '#9ca3af';
    let textColor = '#fff';

    if (status === 'pending') {
      backgroundColor = '#facc15';
      textColor = '#fff';
    } else if (status === 'resolved') {
      backgroundColor = '#10b981';
      textColor = '#fff';
    } else if (status === 'rejected') {
      backgroundColor = '#ef4444';
      textColor = '#fff';
    }

    return (
      <View style={[styles.statusTag, { backgroundColor }]}>
        <Text style={{ color: textColor, fontSize: 13 }}>
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
              {reportData.reportType === 'review'
                ? t('detail.reviewInfo')
                : t('detail.boardingInfo')}
            </Text>

            <View style={styles.row}>
              <Avatar.Image
                source={{ uri: target?.accountId?.avatarImage?.url }}
                size={50}
              />
              <Text style={[styles.text, textColor]}>
                {target?.accountId?.fullname || t('detail.unknown')}
              </Text>
            </View>

            {renderLabelValue(t('detail.rating'), renderStars(target?.rating))}
            {renderLabelValue(
              t('detail.content'),
              target?.content || t('detail.noContent')
            )}

            <Text style={[styles.subTitle, textColor]}>
              {t('detail.images')}:
            </Text>
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
              new Date(createdAt).toLocaleString()
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
            <ScrollView horizontal>
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
  },
  subTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  stars: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statusTag: {
    paddingHorizontal: 14,
    borderRadius: 9999, // bo tròn kiểu pill
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
});
