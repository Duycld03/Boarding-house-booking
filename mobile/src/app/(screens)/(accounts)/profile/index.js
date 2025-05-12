import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

import ScreenContainer, {
  ScrollContainer,
} from '@/components/layout/ScreenContainer';
import { BackHeader } from '@/components/navigation/CustomHeader';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import { FormField } from '@/components/form';
import { getUser } from '@/API/authManagement';
import {
  updateAccountFromProfile,
  updateAvatar,
} from '@/API/AccountManagement';
import { useNotification } from '@/context/NotificationProvider';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';

const genders = ['male', 'female', 'other'];
const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

export default function Profile() {
  const { t } = useTranslation('profile');
  const router = useRouter();
  const { showSuccess, showError } = useNotification();
  const { isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    phoneNumber: '',
    gender: 'male',
    email: '',
    username: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [errors, setErrors] = useState({});

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showError(t('error.permission'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        const fileName = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(fileName || '');
        const type = match ? `image/${match[1]}` : `image`;

        const photo: any = {
          uri,
          name: fileName,
          type,
        };

        const formData = new FormData();
        formData.append('avatar', photo);

        setLoading(true);
        try {
          const response = await updateAvatar(formData); // API như trên web
          showSuccess(response.message || 'Cập nhật ảnh thành công');
          setAvatar(uri); // Cập nhật ảnh hiển thị
        } catch (err) {
          showError(err?.response?.data?.message || 'Không thể cập nhật ảnh');
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('ImagePicker Error:', error);
      showError('Không thể chọn ảnh');
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    let isValid = true;

    if (!formData.fullname.trim()) {
      newErrors.fullname = { message: t('fullname.required') };
      isValid = false;
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = { message: t('phone.required') };
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const loadUser = async () => {
    try {
      const user = await getUser();
      setFormData({
        fullname: user.fullname,
        phoneNumber: user.phoneNumber,
        gender: user.gender || 'male',
        email: user.email,
        username: user.username,
      });
      setAvatar(user.avatarImage?.url || null);
    } catch (err) {
      showError(t('error.fetch'));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      await updateAccountFromProfile(formData);
      showSuccess(t('success.update'));
    } catch (err) {
      showError(err?.response?.data?.message || t('error.update'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <ScreenContainer className={themedClasses.bg}>
      <BackHeader title={t('title')} onBackPress={() => router.back()} />

      <ScrollContainer keyboardAvoiding className="px-4">
        <View className="items-center mt-4">
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{ uri: avatar || DEFAULT_AVATAR }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
          </TouchableOpacity>
          <Text className={`mt-2 text-lg font-semibold ${themedClasses.text}`}>
            @{formData.username}
          </Text>
        </View>

        {/* Email Section */}
        <View className="mt-4">
          <Text className={`text-sm font-medium mb-1 ${themedClasses.text}`}>
            Email
          </Text>
          <View className="flex-row items-start">
            <FormField
              name="email"
              value={formData.email}
              editable={false}
              inputType="email"
              className={`flex-1 ${themedClasses.input}`}
            />
            <TouchableOpacity
              className="ml-2 h-12 px-4 justify-center rounded bg-blue-500"
              onPress={() => {}}
            >
              <Text className="font-semibold text-sm" style={{ color: '#fff' }}>
                Change Email
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Full Name */}
        <FormField
          name="fullname"
          label={t('fullname.label')}
          placeholder={t('fullname.placeholder')}
          value={formData.fullname}
          onChange={handleChange}
          error={errors}
          required
        />

        {/* Phone Number */}
        <FormField
          name="phoneNumber"
          label={t('phone.label')}
          placeholder={t('phone.placeholder')}
          value={formData.phoneNumber}
          onChange={handleChange}
          error={errors}
          keyboardType="phone-pad"
          required
        />

        {/* Gender */}
        <Text className={`text-sm font-medium mb-1 ${themedClasses.text}`}>
          {t('gender.label')}
        </Text>
        <View className="flex-row justify-between mb-4">
          {genders.map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => handleChange('gender', g)}
              className="flex-row items-center"
            >
              <View
                className={`w-5 h-5 rounded-full border-2 ${
                  formData.gender === g ? 'border-blue-500' : 'border-gray-300'
                } items-center justify-center mr-2`}
              >
                {formData.gender === g && (
                  <View className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                )}
              </View>
              <Text className={themedClasses.text}>{t(`gender.${g}`)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          className="mt-4 py-2 px-6 w-32 self-center rounded-md"
        >
          {t('button.save')}
        </Button>
      </ScrollContainer>
    </ScreenContainer>
  );
}
