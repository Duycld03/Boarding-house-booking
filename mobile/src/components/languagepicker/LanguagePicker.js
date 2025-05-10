import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/config-translation/config-translation';
import { useTranslation } from 'react-i18next';
import { useThemedClasses } from '@/utils/useTheme';
import { useTheme } from '@/context/ThemeProvider';
import Color from '@/constants/styles/color';
import Font from '@/constants/styles/fonts';

export default function LanguagePicker() {
  const [language, setLanguage] = useState('en');
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang) {
        setLanguage(savedLang);
        i18n.changeLanguage(savedLang);
      }
    };
    loadLanguage();
  }, []);

  const handleSelect = async (value: string) => {
    setLanguage(value);
    setModalVisible(false);
    await AsyncStorage.setItem('appLanguage', value);
    i18n.changeLanguage(value);
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
          {language === 'vi' ? 'Tiếng Việt' : 'English'} {' ›'}
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
                    fontWeight: language === 'en' ? '700' : '400',
                    color: isDarkMode ? '#ffffff' : '#9098B1',
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
                    fontWeight: language === 'vi' ? '700' : '400',
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
