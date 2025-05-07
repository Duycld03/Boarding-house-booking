import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { RadioButton } from 'react-native-paper';
import Text from '@/components/ui/Text';
import { useThemedClasses } from '@/utils/useTheme';
import { useTheme } from '@/context/ThemeProvider';

const CustomRadio = ({
    label,
    options = [],
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    className = '',
    direction = 'vertical', // 'vertical' or 'horizontal'
    radioPosition = 'left', // 'left' or 'right'
    compact = false,
}) => {
    const { isDarkMode } = useTheme();
    const { themedClasses } = useThemedClasses();

    const errorMessage = error && typeof error === 'object' && error[label]
        ? error[label].message
        : typeof error === 'string'
            ? error
            : null;

    return (
        <View className={`mb-4 ${className}`}>
            {label && (
                <View className="flex-row mb-1">
                    <Text
                        className={`${themedClasses.text} text-sm font-medium`}
                        style={{ fontFamily: 'Poppins-Medium' }}
                    >
                        {label}
                    </Text>
                    {required && (
                        <Text
                            className="ml-0.5"
                            style={{ color: 'red', fontFamily: 'Poppins-Medium' }}
                        >
                            *
                        </Text>
                    )}
                </View>
            )}

            <View
                className={`
          ${direction === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}
          ${errorMessage ? 'border-red-500' : ''}
          ${disabled ? 'opacity-50' : ''}
        `}
            >
                {options.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => {
                            if (!disabled) {
                                onChange(option.value);
                            }
                        }}
                        disabled={disabled || option.disabled}
                        className={`
              flex-row items-center
              ${direction === 'horizontal' ? 'mr-4 mb-2' : 'mb-2'}
              ${option.disabled ? 'opacity-50' : ''}
              ${compact ? 'py-1' : 'py-2'}
            `}
                    >
                        {radioPosition === 'left' && (
                            <RadioButton
                                value={option.value}
                                status={value === option.value ? 'checked' : 'unchecked'}
                                disabled={disabled || option.disabled}
                                color="#40BFFF" // blue checked color
                                uncheckedColor={isDarkMode ? '#6B7280' : '#9CA3AF'} // gray-500/gray-400
                            />
                        )}

                        <View className={`flex-1 ${compact ? '' : 'py-1'}`}>
                            <Text
                                className={`${themedClasses.text} ${compact ? 'text-sm' : ''}`}
                                style={{ fontFamily: 'Poppins-Regular' }}
                                numberOfLines={option.numberOfLines}
                            >
                                {option.label}
                            </Text>

                            {option.description && (
                                <Text
                                    className="text-gray-500 dark:text-gray-400 text-xs mt-0.5"
                                    style={{ fontFamily: 'Poppins-Regular' }}
                                    numberOfLines={option.descriptionNumberOfLines}
                                >
                                    {option.description}
                                </Text>
                            )}
                        </View>

                        {radioPosition === 'right' && (
                            <RadioButton
                                value={option.value}
                                status={value === option.value ? 'checked' : 'unchecked'}
                                disabled={disabled || option.disabled}
                                color="#40BFFF" // blue checked color
                                uncheckedColor={isDarkMode ? '#6B7280' : '#9CA3AF'} // gray-500/gray-400
                            />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {errorMessage && (
                <Text
                    className="text-red-500 text-xs mt-1"
                    style={{ fontFamily: 'Poppins-Regular' }}
                >
                    {errorMessage}
                </Text>
            )}
        </View>
    );
};

export default CustomRadio;