import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/config-translation/config-translation';

export const initLanguage = async () => {
  try {
    const savedLang = await AsyncStorage.getItem('appLanguage');
    if (savedLang && i18n.language !== savedLang) {
      await i18n.changeLanguage(savedLang);
    }
  } catch (error) {
    console.error('Failed to initialize language:', error);
  }
};
