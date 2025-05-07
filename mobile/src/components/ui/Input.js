import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Animated } from 'react-native';
import { useThemedClasses } from '@/utils/useTheme';
import Text from './Text';
import { Ionicons } from '@expo/vector-icons';

/**
 * CustomInput component with support for different states, icons and password visibility toggle
 * @param {string} label - label text
 * @param {string} placeholder - placeholder text
 * @param {boolean} error - whether there is an error
 * @param {string} errorText - error message
 * @param {boolean} disabled - whether the input is disabled
 * @param {function} onChangeText - function to call when text changes
 * @param {string} value - input value
 * @param {ReactNode} leftIcon - icon to display on the left
 * @param {ReactNode} rightIcon - icon to display on the right
 * @param {object} style - additional style for the input container
 * @param {object} inputStyle - additional style for the input itself
 * @param {string} className - additional className for the container
 * @param {string} inputClassName - additional className for the input
 * @param {boolean} secureTextEntry - whether this is a password input
 * @param {boolean} showPasswordToggle - whether to show password visibility toggle (default true for password inputs)
 */
const Input = ({
    label,
    placeholder,
    error = false,
    errorText,
    disabled = false,
    onChangeText,
    value,
    leftIcon,
    rightIcon,
    style,
    inputStyle,
    className = '',
    inputClassName = '',
    secureTextEntry,
    showPasswordToggle = secureTextEntry,
    ...props
}) => {
    const { themedClasses } = useThemedClasses();
    const [isFocused, setIsFocused] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const scaleAnim = useState(new Animated.Value(1))[0];

    // Container classes
    const containerClasses = themedClasses(
        "w-full",
        "w-full"
    );

    const inputWrapperClasses = themedClasses(
        `flex-row items-center border rounded-lg px-3 ${error ? 'border-red-500' : isFocused ? 'border-primary-light' : 'border-gray-300'} ${disabled ? 'bg-gray-100' : 'bg-white'}`,
        `flex-row items-center border rounded-lg px-3 ${error ? 'border-red-500' : isFocused ? 'border-primary-dark' : 'border-gray-700'} ${disabled ? 'bg-gray-800' : 'bg-gray-900'}`
    );

    const inputBaseClasses = themedClasses(
        "flex-1 py-3 text-text-light font-normal",
        "flex-1 py-3 text-text-dark font-normal"
    );

    const wrapperClassName = `${inputWrapperClasses} ${className}`;
    const inputFullClassName = `${inputBaseClasses} ${inputClassName}`;

    const togglePasswordVisibility = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 80,
                useNativeDriver: true,
            })
        ]).start();

        setPasswordVisible(prev => !prev);
    };

    return (
        <View className={containerClasses} style={style}>
            {label && (
                <Text
                    variant="label"
                    weight="medium"
                    className={themedClasses(
                        "mb-1 text-gray-700",
                        "mb-1 text-gray-300"
                    )}
                >
                    {label}
                </Text>
            )}

            <View className={wrapperClassName}>
                {leftIcon && (
                    <View className="mr-2">
                        {leftIcon}
                    </View>
                )}

                <TextInput
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    editable={!disabled}
                    className={inputFullClassName}
                    style={inputStyle}
                    placeholderTextColor={themedClasses("#9ca3af", "#6b7280")}
                    secureTextEntry={secureTextEntry && !passwordVisible}
                    {...props}
                />

                {showPasswordToggle && secureTextEntry && (
                    <TouchableOpacity
                        onPress={togglePasswordVisibility}
                        activeOpacity={0.7}
                        className="ml-2"
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                        disabled={disabled}
                    >
                        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <Ionicons
                                name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                                size={22}
                                color={themedClasses("#6b7280", "#9ca3af")}
                            />
                        </Animated.View>
                    </TouchableOpacity>
                )}

                {rightIcon && !showPasswordToggle && (
                    <View className="ml-2">
                        {rightIcon}
                    </View>
                )}
            </View>

            {error && errorText && (
                <Text
                    variant="caption"
                    className="mt-1"
                    color="#EF4444"
                >
                    {errorText}
                </Text>
            )}
        </View>
    );
};


export default Input;