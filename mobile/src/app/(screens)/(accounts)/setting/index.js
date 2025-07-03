import React from 'react';
import { View, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import LanguagePicker from './LanguagePicker';
import { useTranslation } from 'react-i18next';
import i18n from '@/config-translation/config-translation';
import Text from '@/components/ui/Text';
import { ScreenContainer } from '@/components/layout';
import Color from '@/constants/styles/color';
import Font from '@/constants/styles/fonts';
import { useNavigation } from '@react-navigation/native';
import { BackHeader } from '@/components/navigation/CustomHeader';

export default function Setting() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { t, ready } = useTranslation('setting');
  const navigation = useNavigation();

  // ✅ Chặn render nếu i18n chưa khởi tạo hoặc namespace 'setting' chưa sẵn sàng
  if (!i18n.isInitialized || !ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDarkMode ? '#000' : '#fff',
        }}
      >
        <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#333'} />
      </View>
    );
  }

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
      <BackHeader
        backIcon={
          <FontAwesome5
            name="chevron-left"
            size={18}
            color={isDarkMode ? '#fff' : '#333'}
          />
        }
        title={t('back')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="p-5">
          {/* Giao diện */}
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
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
