import React from 'react';
import { View, Text } from 'react-native';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useThemedClasses } from '@/utils/useTheme';
import { BackHeader } from '@/components/navigation/CustomHeader';

const DetailReport = () => {
  const { themedClasses, isDarkMode } = useThemedClasses();

  return (
    <ScreenContainer className={themedClasses.bg} withPadding={false}>
      <BackHeader title="Report Detail Management" />
      <View
        style={{
          flex: 1,
          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        }}
      >
        <Text>Chi tiết báo cáo</Text>
      </View>
    </ScreenContainer>
  );
};

export default DetailReport;
