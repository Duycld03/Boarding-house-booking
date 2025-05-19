import React from 'react';
import { View, Switch, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import LanguagePicker from './LanguagePicker';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { ScreenContainer } from '@/components/layout';
import Color from '@/constants/styles/color';
import Font from '@/constants/styles/fonts';
import Button from '@/components/ui/Button';
import { useNavigation } from '@react-navigation/native';

export default function Setting() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { t } = useTranslation('setting');
  const navigation = useNavigation();

  const primaryColor = isDarkMode ? '#60a5fa' : '#3b82f6';

  const cardStyle = themedClasses(
    'rounded-2xl bg-white border border-[#E5EAF2] overflow-hidden mb-6',
    'rounded-2xl bg-[#2A2A2A] border border-[#3A3A3A] overflow-hidden mb-6'
  );

  const cardHeaderStyle = themedClasses(
    'border-b border-[#E5EAF2] px-4 py-2',
    'border-b border-[#3A3A3A] px-4 py-2'
  );

  const labelStyle = {
    fontFamily: Font.pSemiBold,
    fontSize: 16,
    color: isDarkMode ? Color.white : Color.title,
  };

  const subLabelStyle = {
    fontFamily: Font.pRegular,
    fontSize: 13,
    color: isDarkMode ? Color.gray : Color.text,
  };

  return (
    <ScreenContainer
      withPadding={false}
      className={themedClasses('bg-background-light', 'bg-background-dark')}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="p-5">
          {/* Tiêu đề Setting */}
          <View
            className={themedClasses(
              'mb-6 border-b border-gray-200 pb-3',
              'mb-6 border-b border-gray-700 pb-3'
            )}
          >
            <Text
              style={{
                fontFamily: Font.pBold,
                fontSize: 20,
                lineHeight: 30,
                color: isDarkMode ? Color.white : Color.title,
              }}
            >
              {t('settings')}
            </Text>
          </View>

          {/* Giao diện - Appearance */}
          <View className={cardStyle}>
            <View className={cardHeaderStyle}>
              <Text
                style={{
                  fontFamily: Font.pSemiBold,
                  fontSize: 14,
                  color: primaryColor,
                }}
              >
                {t('appearance')}
              </Text>
            </View>

            <View className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center gap-4">
                <Ionicons name="moon-outline" size={20} color={primaryColor} />
                <View>
                  <Text style={labelStyle}>{t('dark_mode')}</Text>
                  <Text style={subLabelStyle}>
                    {t('dark_mode_description')}
                  </Text>
                </View>
              </View>
              <Switch value={isDarkMode} onValueChange={toggleTheme} />
            </View>
          </View>

          {/* Ngôn ngữ */}
          <View className={cardStyle}>
            <View className={cardHeaderStyle}>
              <Text
                style={{
                  fontFamily: Font.pSemiBold,
                  fontSize: 14,
                  color: primaryColor,
                }}
              >
                {t('language')}
              </Text>
            </View>

            <View className="px-4 py-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <FontAwesome name="globe" size={20} color={primaryColor} />
                <View>
                  <Text
                    style={{
                      fontFamily: Font.pSemiBold,
                      fontSize: 15,
                      color: isDarkMode ? Color.white : Color.title,
                    }}
                  >
                    {t('language')}
                  </Text>
                  <Text style={subLabelStyle}>
                    {t('select_display_language')}
                  </Text>
                </View>
              </View>
              <LanguagePicker />
            </View>
          </View>

          <View className="h-8" />

          {/* Nút Back */}
          <View className="items-center">
            <Button
              onPress={() => navigation.goBack()}
              fullWidth={false}
              className={themedClasses(
                'flex-row items-center justify-center px-5 py-2 rounded-full bg-primary-light',
                'flex-row items-center justify-center px-5 py-2 rounded-full bg-primary-dark'
              )}
            >
              <Ionicons
                name="arrow-back"
                size={12}
                color="#fff"
                style={{ marginRight: 6, transform: [{ translateY: 1 }] }}
              />
              <Text
                style={{
                  fontFamily: Font.pSemiBold,
                  fontSize: 14,
                  lineHeight: 18,
                  color: '#fff',
                }}
              >
                {t('back', { defaultValue: 'Quay lại' })}
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
