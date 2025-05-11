import React from 'react';
import { View, Switch, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import LanguagePicker from './LanguagePicker';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { ScreenContainer } from '@/components/layout';

export default function Setting() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { t } = useTranslation('setting');

  const primaryColor = isDarkMode ? '#60a5fa' : '#3b82f6';

  const cardStyle = themedClasses(
    'rounded-2xl bg-white border border-[#E5EAF2] overflow-hidden mb-6',
    'rounded-2xl bg-[#2A2A2A] border border-[#3A3A3A] overflow-hidden mb-6'
  );

  const cardHeaderStyle = themedClasses(
    'border-b border-[#E5EAF2] px-4 py-2',
    'border-b border-[#3A3A3A] px-4 py-2'
  );

  const labelStyle = themedClasses(
    'text-base font-semibold text-black',
    'text-base font-semibold text-white'
  );

  const subLabelStyle = themedClasses(
    'text-sm text-[#9098B1]',
    'text-sm text-[#A0A0A0]'
  );

  return (
    <ScreenContainer withPadding={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="p-5">
          <View
            className={themedClasses(
              'mb-6 border-b border-gray-200 pb-3',
              'mb-6 border-b border-gray-700 pb-3'
            )}
          >
            <Text
              className={themedClasses(
                'text-2xl text-text-light',
                'text-2xl text-text-dark'
              )}
              style={{
                fontFamily: 'Poppins-Bold',
                fontSize: 20,
                lineHeight: 30,
              }}
            >
              {t('settings')}
            </Text>
          </View>

          {/* Appearance Section */}
          <View className={cardStyle}>
            <View className={cardHeaderStyle}>
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
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
                  <Text
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                    className={labelStyle}
                  >
                    {t('dark_mode')}
                  </Text>
                  <Text
                    style={{ fontFamily: 'Poppins-Regular' }}
                    className={subLabelStyle}
                  >
                    {t('dark_mode_description')}
                  </Text>
                </View>
              </View>
              <Switch value={isDarkMode} onValueChange={toggleTheme} />
            </View>
          </View>

          {/* Language Section */}
          <View className={cardStyle}>
            <View className={cardHeaderStyle}>
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
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
                      fontFamily: 'Poppins-SemiBold',
                      fontSize: 15,
                      color: isDarkMode ? '#fff' : '#000',
                    }}
                  >
                    {t('language')}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: 13,
                      color: isDarkMode ? '#A0A0A0' : '#9098B1',
                    }}
                  >
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
