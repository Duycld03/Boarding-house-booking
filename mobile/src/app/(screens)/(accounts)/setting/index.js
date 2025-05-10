import React from 'react';
import { View, Text, Switch } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import LanguagePicker from '@/components/languagepicker/LanguagePicker';
import { useTranslation } from 'react-i18next';

export default function Setting() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { t } = useTranslation('setting');

  const cardStyle = themedClasses(
    'rounded-2xl bg-white border border-[#E5EAF2] overflow-hidden mb-6',
    'rounded-2xl bg-[#2A2A2A] border border-[#3A3A3A] overflow-hidden mb-6'
  );

  const cardHeaderStyle = themedClasses(
    'border-b border-[#E5EAF2] px-4 py-2',
    'border-b border-[#3A3A3A] px-4 py-2'
  );

  const titleTextStyle = themedClasses(
    'text-xs font-bold text-[#6E56CF]',
    'text-xs font-bold text-[#A99AFF]'
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
    <View
      className={themedClasses(
        'flex-1 bg-white px-4 py-6',
        'flex-1 bg-background-dark px-4 py-6'
      )}
    >
      <Text
        className={themedClasses(
          'text-2xl font-bold text-title mb-4',
          'text-2xl font-bold text-white mb-4'
        )}
      >
        {t('settings')}
      </Text>

      {/* Appearance Section */}
      <View className={cardStyle}>
        <View className={cardHeaderStyle}>
          <Text
            style={{ fontFamily: 'Poppins-SemiBold' }}
            className={titleTextStyle}
          >
            {t('appearance')}
          </Text>
        </View>

        <View className="flex-row items-center justify-between px-4 py-4">
          <View className="flex-row items-center gap-4">
            <Ionicons
              name="moon-outline"
              size={20}
              color={isDarkMode ? '#A99AFF' : '#6E56CF'}
            />
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
            style={{ fontFamily: 'Poppins-SemiBold' }}
            className={titleTextStyle}
          >
            {t('language')}
          </Text>
        </View>

        <View
          className="px-4 py-4"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <FontAwesome
              name="globe"
              size={20}
              color={isDarkMode ? '#A99AFF' : '#6E56CF'}
            />
            <View>
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  color: isDarkMode ? '#FFF' : '#000',
                }}
              >
                {t('language')}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'Poppins-Regular',
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

      {/* Notifications Section */}
      <View className={cardStyle}>
        <View className={cardHeaderStyle}>
          <Text
            style={{ fontFamily: 'Poppins-SemiBold' }}
            className={titleTextStyle}
          >
            {t('notifications')}
          </Text>
        </View>

        {/* Push Notifications */}
        <View
          className={themedClasses(
            'flex-row items-center justify-between px-4 py-4 border-b border-[#E5EAF2]',
            'flex-row items-center justify-between px-4 py-4 border-b border-[#3A3A3A]'
          )}
        >
          <View className="flex-row items-center gap-4">
            <Ionicons
              name="notifications-outline"
              size={20}
              color={isDarkMode ? '#A99AFF' : '#6E56CF'}
            />
            <View>
              <Text
                style={{ fontFamily: 'Poppins-SemiBold' }}
                className={labelStyle}
              >
                {t('push_notifications')}
              </Text>
              <Text
                style={{ fontFamily: 'Poppins-Regular' }}
                className={subLabelStyle}
              >
                {t('push_notifications_desc')}
              </Text>
            </View>
          </View>
          <Switch value={true} />
        </View>

        {/* Notification Sound */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <View className="flex-row items-center gap-4">
            <Ionicons
              name="mic-outline"
              size={20}
              color={isDarkMode ? '#A99AFF' : '#6E56CF'}
            />
            <View>
              <Text
                style={{ fontFamily: 'Poppins-SemiBold' }}
                className={labelStyle}
              >
                {t('notification_sound')}
              </Text>
              <Text
                style={{ fontFamily: 'Poppins-Regular' }}
                className={subLabelStyle}
              >
                {t('notification_sound_desc')}
              </Text>
            </View>
          </View>
          <Switch value={false} />
        </View>
      </View>
    </View>
  );
}
