import React, { useState, useCallback, createContext, useContext } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useThemedClasses } from '@/utils/useTheme';

// Form Context để quản lý state của form và chia sẻ giữa các components
const FormContext = createContext(null);

/**
 * Hook để sử dụng FormContext trong các form fields
 */
export const useForm = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useForm must be used within a Form component');
    }
    return context;
};

/**
 * Form Component chính
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Form fields components
 * @param {Function} props.onSubmit - Function được gọi khi form submit
 * @param {Object} props.initialValues - Giá trị ban đầu của form
 * @param {Function} props.validate - Function validation tùy chỉnh
 * @param {string} props.className - Additional className
 * @param {Object} props.style - Additional style
 * @param {boolean} props.scrollable - Whether form should be scrollable
 */
const Form = ({
    children,
    onSubmit,
    initialValues = {},
    validate,
    className = '',
    style,
    scrollable = true,
    submitLabel = 'Submit',
    submitClassName = '',
    hideSubmitButton = false,
    loading = false,
}) => {
    const [formData, setFormData] = useState(initialValues);
    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});
    const { themedClasses } = useThemedClasses();

    // Xử lý thay đổi giá trị của field
    const handleChange = useCallback((name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error khi user thay đổi giá trị
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);

    // Đánh dấu field đã được tương tác
    const handleBlur = useCallback((name) => {
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        // Validate field khi blur
        validateField(name);
    }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

    // Validate một field cụ thể
    const validateField = useCallback((name) => {
        if (!validate) return;

        const fieldErrors = validate(formData);
        if (fieldErrors && fieldErrors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: fieldErrors[name]
            }));
        }
    }, [formData, validate]);

    // Validate tất cả các fields
    const validateForm = useCallback(() => {
        if (!validate) return true;

        const formErrors = validate(formData);
        if (formErrors && Object.keys(formErrors).length > 0) {
            setErrors(formErrors);

            // Đánh dấu tất cả fields là đã touched để hiển thị lỗi
            const allTouched = {};
            Object.keys(formErrors).forEach(key => {
                allTouched[key] = true;
            });

            setTouched(prev => ({
                ...prev,
                ...allTouched
            }));

            return false;
        }

        return true;
    }, [formData, validate]);

    // Reset form về giá trị ban đầu
    const resetForm = useCallback(() => {
        setFormData(initialValues);
        setTouched({});
        setErrors({});
    }, [initialValues]);

    // Xử lý submit form
    const handleSubmit = useCallback(() => {
        const isValid = validateForm();

        if (isValid && onSubmit) {
            onSubmit(formData);
        }
    }, [formData, onSubmit, validateForm]);

    // Context value để chia sẻ với các form fields
    const formContextValue = {
        formData,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm
    };

    const buttonClasses = themedClasses(
        "bg-blue-500 active:bg-blue-600",
        "bg-blue-600 active:bg-blue-700"
    );

    const Container = scrollable ? ScrollView : View;

    return (
        <FormContext.Provider value={formContextValue}>
            <Container
                className={`w-full ${className}`}
                contentContainerStyle={{ flexGrow: 1 }}
                style={style}
                showsVerticalScrollIndicator={false}
            >
                <View className="w-full">
                    {children}

                    {!hideSubmitButton && (
                        <TouchableOpacity
                            className={`mt-4 py-3 px-6 rounded-lg items-center justify-center ${buttonClasses} ${submitClassName}`}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text className="text-white font-medium text-base">
                                {loading ? 'Loading...' : submitLabel}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </Container>
        </FormContext.Provider>
    );
};

/**
 * Đây là phiên bản được cải tiến của FormField để tích hợp với Form context
 */
export const FormFieldConnected = ({
    name,
    label,
    placeholder,
    required = false,
    leftIcon,
    rightIcon,
    style,
    className = '',
    inputType = 'text',
    ...props
}) => {
    const { formData, errors, touched, handleChange, handleBlur } = useForm();

    // Sử dụng lại component FormField hiện có của bạn
    // Import FormField component từ file của bạn
    const FormField = require('./FormField').default;

    return (
        <FormField
            name={name}
            label={label}
            placeholder={placeholder}
            error={touched[name] ? errors : null}
            onChange={handleChange}
            onBlur={handleBlur}
            value={formData[name] || ''}
            required={required}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            style={style}
            className={className}
            inputType={inputType}
            {...props}
        />
    );
};

// Ví dụ về sử dụng Form và các validation helpers
export const Validators = {
    required: (value) => (!value || value.trim() === '') ? { message: 'Trường này là bắt buộc' } : null,
    email: (value) => {
        if (!value) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? { message: 'Email không hợp lệ' } : null;
    },
    minLength: (min) => (value) => {
        if (!value) return null;
        return value.length < min ? { message: `Tối thiểu ${min} ký tự` } : null;
    },
    maxLength: (max) => (value) => {
        if (!value) return null;
        return value.length > max ? { message: `Tối đa ${max} ký tự` } : null;
    },
    phone: (value) => {
        if (!value) return null;
        const phoneRegex = /^[0-9]{10,11}$/;
        return !phoneRegex.test(value) ? { message: 'Số điện thoại không hợp lệ' } : null;
    },
    // Kết hợp nhiều validator
    compose: (...validators) => (value) => {
        for (const validator of validators) {
            const error = validator(value);
            if (error) return error;
        }
        return null;
    }
};

export default Form;