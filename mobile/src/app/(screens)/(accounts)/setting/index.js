import React from 'react';
import { View, Text, Switch, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import LanguagePicker from '@/components/languagepicker/LanguagePicker';

export default function Setting() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { themedClasses } = useThemedClasses();

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

  const rightTextStyle = themedClasses(
    'text-sm text-[#223263]',
    'text-sm text-white'
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
        Settings
      </Text>

      {/* Appearance Section */}
      <View className={cardStyle}>
        <View className={cardHeaderStyle}>
          <Text
            className={titleTextStyle}
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            APPEARANCE
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
                className={labelStyle}
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Dark mode
              </Text>
              <Text
                className={subLabelStyle}
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Choose between light and dark mode
              </Text>
            </View>
          </View>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>
      </View>

      <View className={cardStyle}>
        <View className={cardHeaderStyle}>
          <Text
            className={titleTextStyle}
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            LANGUAGE
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
          {/* Left: icon + label */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <FontAwesome
              name="globe"
              size={20}
              color={isDarkMode ? '#A99AFF' : '#6E56CF'}
            />
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Poppins-SemiBold',
                  color: isDarkMode ? '#FFF' : '#000',
                }}
              >
                Language
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'Poppins-Regular',
                  color: isDarkMode ? '#A0A0A0' : '#9098B1',
                }}
              >
                Select display language
              </Text>
            </View>
          </View>

          {/* Right: language picker component */}
          <LanguagePicker />
        </View>
      </View>

      {/* Notifications Section */}
      <View className={cardStyle}>
        <View className={cardHeaderStyle}>
          <Text
            className={titleTextStyle}
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            NOTIFICATIONS
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
                className={labelStyle}
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Push Notifications
              </Text>
              <Text
                className={subLabelStyle}
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Receive alerts from the app
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
                className={labelStyle}
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Notification Sound
              </Text>
              <Text
                className={subLabelStyle}
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Play sound for new alerts
              </Text>
            </View>
          </View>
          <Switch value={false} />
        </View>
      </View>
    </View>
  );
}
