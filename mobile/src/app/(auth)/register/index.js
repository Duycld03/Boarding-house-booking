import React, { useState } from 'react';
import ScreenContainer, { ScrollContainer } from '@/components/layout/ScreenContainer';
import { BackHeader } from '@/components/navigation/CustomHeader';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import { useNotification } from '@/context/NotificationProvider';
import { CustomDatePicker, CustomRadio, Checkbox, FormField } from '@/components/form/index';
import { ConfirmModal } from '@/components/feedback';
import { View, TouchableOpacity } from 'react-native';

export default function Register() {
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [birthDate, setBirthDate] = useState(null);


  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = { message: 'Vui lòng nhập họ tên' };
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = { message: 'Vui lòng nhập email' };
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = { message: 'Email không hợp lệ' };
        isValid = false;
      }
    }
    if (!formData.password) {
      newErrors.password = { message: 'Vui lòng nhập mật khẩu' };
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = { message: 'Mật khẩu phải có ít nhất 6 ký tự' };
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = { message: 'Vui lòng xác nhận mật khẩu' };
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = { message: 'Mật khẩu không khớp' };
      isValid = false;
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = { message: 'Bạn cần đồng ý với Điều khoản và Điều kiện' };
      isValid = false;
    }

    if (!birthDate) {
      newErrors.birthDate = { message: 'Vui lòng chọn ngày sinh' };
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = () => {
    if (!validateForm()) {
      showError('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      console.log('Form data submitted:', formData);

      showSuccess('Đăng ký thành công!');

    }, 1500);
  };

  const [selectedValue, setSelectedValue] = useState('option1');

  const radioOptions = [
    { value: 'option1', label: 'Tùy chọn 1', description: 'Mô tả cho tùy chọn 1' },
    { value: 'option2', label: 'Tùy chọn 2' },
    { value: 'option3', label: 'Tùy chọn 3', disabled: true },
  ];

  const termsError = errors.agreeTerms?.message || null;

  const [modalVisible, setModalVisible] = useState(false);
  const [dangerModalVisible, setDangerModalVisible] = useState(false);

  const handleConfirmAction = () => {
    // Xử lý khi người dùng xác nhận
    console.log('Người dùng đã xác nhận hành động');
  };

  const handleDeleteAction = () => {
    // Xử lý khi người dùng xác nhận xóa
    console.log('Người dùng đã xác nhận xóa');
  };

  return (
    <ScreenContainer>
      <BackHeader
        title="Register"
        animationType="slide"
      />

      <ScrollContainer keyboardAvoiding className="px-4">
        <Text
          variant="h2"
          weight="bold"
          className="mt-4 mb-6"
        >
          Tạo tài khoản mới
        </Text>

        <FormField
          name="fullName"
          label="Họ và tên"
          placeholder="Nhập họ và tên"
          value={formData.fullName}
          onChange={handleChange}
          error={errors}
          required
        />

        <FormField
          name="email"
          label="Email"
          placeholder="Nhập địa chỉ email"
          value={formData.email}
          onChange={handleChange}
          error={errors}
          inputType="email"
          required
        />

        <FormField
          name="password"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          value={formData.password}
          onChange={handleChange}
          error={errors}
          inputType="password"
          required
        />

        <FormField
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors}
          inputType="password"
          required
        />

        <Checkbox
          checked={agreeTerms}
          onPress={() => {
            setAgreeTerms(!agreeTerms);
            if (errors.agreeTerms) {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.agreeTerms;
                return newErrors;
              });
            }
          }}
          label="Tôi đồng ý với Điều khoản và Điều kiện"
          className="mt-4 mb-6"
          error={termsError}
        />
        <CustomDatePicker
          label="Ngày sinh"
          value={birthDate}
          onChange={setBirthDate}
          mode="time"
          required
          error={errors?.birthDate}
        />
        <CustomRadio
          label="Chọn một tùy chọn"
          options={radioOptions}
          value={selectedValue}
          onChange={setSelectedValue}
          required={true}
          direction="vertical"
          radioPosition="left"
        />

        <ConfirmModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onConfirm={handleConfirmAction}
          title="Xác nhận đặt hàng"
          message="Bạn có chắc chắn muốn đặt đơn hàng này không?"
          confirmText="Đặt hàng"
          cancelText="Để sau"
        />

        <Button
          onPress={handleRegister}
          loading={loading}
          fullWidth
          className="mt-4"
        >
          Đăng Ký
        </Button>


        <View className="flex-1 p-4 justify-center">
          {/* Nút mở modal thông thường */}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-blue-500 py-3 px-4 rounded-lg mb-4"
          >
            <Text className="text-white text-center font-medium">
              Mở modal xác nhận
            </Text>
          </TouchableOpacity>

          {/* Nút mở modal nguy hiểm */}
          <TouchableOpacity
            onPress={() => setDangerModalVisible(true)}
            className="bg-red-500 py-3 px-4 rounded-lg"
          >
            <Text className="text-white text-center font-medium">
              Mở modal xóa
            </Text>
          </TouchableOpacity>

          {/* Modal xác nhận thông thường */}
          <ConfirmModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onConfirm={handleConfirmAction}
            title="Xác nhận đặt hàng"
            message="Bạn có chắc chắn muốn đặt đơn hàng này không?"
            confirmText="Đặt hàng"
            cancelText="Để sau"
          />

          {/* Modal xác nhận xóa */}
          <ConfirmModal
            visible={dangerModalVisible}
            onClose={() => setDangerModalVisible(false)}
            onConfirm={handleDeleteAction}
            title="Xóa sản phẩm"
            message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
            confirmText="Xóa"
            cancelText="Hủy"
            dangerMode={true}
          />
        </View>
      </ScrollContainer>
    </ScreenContainer>
  );
}