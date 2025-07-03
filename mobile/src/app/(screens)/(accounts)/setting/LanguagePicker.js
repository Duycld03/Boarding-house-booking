import React, { useState, useEffect } from 'react';
import {
  View,
  Pressable,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import i18n from '@/config-translation/config-translation';
import { useTheme } from '@/context/ThemeProvider';
import Color from '@/constants/styles/color';
import Font from '@/constants/styles/fonts';
import Text from '@/components/ui/Text';

export default function LanguagePicker() {
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  const currentLang = i18n.language || 'en';

  const handleSelect = async (value) => {
    setModalVisible(false);
    await AsyncStorage.setItem('appLanguage', value);
    await i18n.changeLanguage(value);
  };

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: isDarkMode ? '#ffffff' : '#9098B1',
            fontFamily: Font.pRegular,
          }}
        >
          {currentLang === 'vi' ? 'Tiếng Việt' : 'English'} {' ›'}
        </Text>
      </Pressable>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDarkMode ? '#2b2b2e' : '#fff',
              },
            ]}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: Font.pSemiBold,
                textAlign: 'center',
                marginBottom: 20,
                color: isDarkMode ? Color.white : Color.title,
              }}
            >
              🌐 {t('language')}
            </Text>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleSelect('en')}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    fontWeight: currentLang === 'en' ? '700' : '400',
                    color: isDarkMode ? Color.white : '#333',
                  },
                ]}
              >
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleSelect('vi')}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    fontWeight: currentLang === 'vi' ? '700' : '400',
                    color: isDarkMode ? Color.white : '#333',
                  },
                ]}
              >
                Tiếng Việt
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: 280,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  option: {
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: Font.pRegular,
  },
});
