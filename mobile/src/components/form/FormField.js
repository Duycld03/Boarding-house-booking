import React from 'react';
import { View, Text } from 'react-native';
import { useThemedClasses } from '@/utils/useTheme';
import Input from '../ui/Input';

/**
 * FormField component that combines label, input and error message
 * @param {string} name - field name (for form state)
 * @param {string} label - field label
 * @param {string} placeholder - input placeholder
 * @param {object} error - error object from form validation
 * @param {function} onChange - function to call when value changes
 * @param {function} onBlur - function to call when field is blurred
 * @param {string} value - field value
 * @param {boolean} required - whether field is required
 * @param {ReactNode} leftIcon - icon to display on the left of input
 * @param {ReactNode} rightIcon - icon to display on the right of input
 * @param {object} style - additional style for the container
 * @param {string} className - additional className for the container
 * @param {string} inputType - type of input (text, password, email, etc.)
 */
const FormField = ({
    name,
    label,
    placeholder,
    error,
    onChange,
    onBlur,
    value,
    required = false,
    leftIcon,
    rightIcon,
    style,
    className = '',
    inputType = 'text',
    ...props
}) => {
    const { themedClasses } = useThemedClasses();

    // Determine if there's an error for this field
    const hasError = error && error[name];
    const errorMessage = hasError ? error[name].message : '';

    // Handle input type specific props
    const getInputTypeProps = () => {
        switch (inputType) {
            case 'password':
                return { secureTextEntry: true };
            case 'email':
                return {
                    keyboardType: 'email-address',
                    autoCapitalize: 'none',
                    autoComplete: 'email'
                };
            case 'number':
                return { keyboardType: 'numeric' };
            case 'phone':
                return { keyboardType: 'phone-pad' };
            default:
                return {
                    keyboardType: 'default',
                    autoCapitalize: 'none',
                    autoComplete: 'off'
                };
        }
    };

    const isError = Boolean(hasError);

    const renderLabel = () => {
        if (!label) return null;

        const labelTextColor = themedClasses(
            "text-gray-700",
            "text-gray-300"
        );

        return (
            <View className="flex-row mb-1">
                <Text className={`text-sm font-medium ${labelTextColor}`}>
                    {label}
                </Text>
                {required && (
                    <Text className="text-sm text-red-500 ml-0.5">*</Text>
                )}
            </View>
        );
    };

    return (
        <View className={`mb-4 ${className}`} style={style}>
            {renderLabel()}
            <Input
                placeholder={placeholder}
                onChangeText={(text) => onChange(name, text)}
                onBlur={() => onBlur && onBlur(name)}
                value={value}
                error={isError}
                errorText={errorMessage}
                leftIcon={leftIcon}
                rightIcon={rightIcon}
                {...getInputTypeProps()}
                {...props}
            />
        </View>
    );
};

export default FormField;