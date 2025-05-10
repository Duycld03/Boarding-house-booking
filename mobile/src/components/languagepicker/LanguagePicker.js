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

export default function LanguagePicker() {
  const [language, setLanguage] = useState('en');
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();

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
            color: '#9098B1',
            fontFamily: 'Poppins-Regular',
          }}
        >
          {language === 'vi' ? 'Tiếng Việt' : 'English'} {' ›'}
        </Text>
      </Pressable>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🌐 {t('language')}</Text>
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleSelect('en')}
            >
              <Text
                style={[
                  styles.optionText,
                  language === 'en' && styles.selected,
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
                  language === 'vi' && styles.selected,
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
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  option: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  optionText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  selected: {
    fontWeight: '700',
    color: '#5C61F4',
  },
});
