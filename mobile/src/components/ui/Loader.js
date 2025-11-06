import { ActivityIndicator, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedClasses } from '@/utils/useTheme';

function Loader({
  size = 'large',
  color,
  text,
  showText = true,
  overlay = false,
}) {
  const { t } = useTranslation('common');
  const { isDarkMode } = useThemedClasses();

  // Fallback text
  const displayText = text || t('loaderComponent.loading');

  // Color fallback theo theme
  const spinnerColor = color || (isDarkMode ? '#3B82F6' : '#1D4ED8');
  const backgroundColor = isDarkMode ? '#0f172a' : '#f9fafb';
  const textColor = isDarkMode ? '#e2e8f0' : '#4b5563';
  const overlayBackground = isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)';
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';

  if (overlay) {
    return (
      <View
        className="absolute inset-0 justify-center items-center z-50"
        style={{ backgroundColor: overlayBackground }}
      >
        <View
          className="rounded-lg p-6 items-center shadow-lg"
          style={{ backgroundColor: cardBg }}
        >
          <ActivityIndicator size={size} color={spinnerColor} />
          {showText && (
            <Text
              className="mt-3 text-base font-medium"
              style={{ color: textColor }}
            >
              {displayText}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-1 justify-center items-center"
      style={{ backgroundColor }}
    >
      <ActivityIndicator size={size} color={spinnerColor} />
      {showText && (
        <Text className="mt-3 text-base" style={{ color: textColor }}>
          {displayText}
        </Text>
      )}
    </View>
  );
}

export default Loader;
