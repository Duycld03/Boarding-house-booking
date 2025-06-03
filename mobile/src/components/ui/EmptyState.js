import React from 'react';
import { View, Text } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';

const EmptyState = ({
  title = 'No data',
  message = 'Nothing to display at the moment.',
  iconName = 'inbox',
}) => {
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();

  return (
    <View className="flex-1 justify-center items-center py-20 px-6">
      <View
        className={themedClasses(
          'bg-white/95 backdrop-blur-sm border border-gray-200/50 p-12 rounded-3xl shadow-xl max-w-sm w-full',
          'bg-gray-800/95 backdrop-blur-sm border-gray-700/50 shadow-2xl shadow-black/40'
        )}
      >
        <View className="items-center">
          {/* Gradient glow behind icon */}
          <View className="relative mb-8">
            <View className="absolute -inset-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-20 blur-xl" />
            <View
              className={themedClasses(
                'bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-full relative shadow-lg',
                'bg-gradient-to-br from-blue-900/40 to-purple-900/40 shadow-xl'
              )}
            >
              <AntDesign
                name={iconName}
                size={72}
                color={isDarkMode ? '#8B5CF6' : '#6366F1'}
              />
            </View>
          </View>

          <Text
            className={themedClasses(
              'text-gray-800 text-2xl font-bold mb-4 text-center',
              'text-gray-200'
            )}
          >
            {title}
          </Text>
          <Text
            className={themedClasses(
              'text-gray-600 text-center leading-6 text-base',
              'text-gray-400'
            )}
          >
            {message}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default EmptyState;
