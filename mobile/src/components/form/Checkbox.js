import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { useThemedClasses } from '@/utils/useTheme';
import Text from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';

/**
 * Custom Checkbox component with label using standard React Native components
 * @param {boolean} checked - whether checkbox is checked
 * @param {function} onPress - function to call when checkbox is toggled
 * @param {string} label - checkbox label
 * @param {boolean} disabled - whether checkbox is disabled
 * @param {object} style - additional style for the container
 * @param {string} className - additional className for the container
 */
const Checkbox = ({
    checked = false,
    onPress,
    label,
    disabled = false,
    style,
    className = '',
    ...props
}) => {
    const { themedClasses, isDarkMode } = useThemedClasses();
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    // Animate checkbox when pressed
    const handlePress = () => {
        if (disabled) return;

        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.85,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        if (onPress) {
            onPress();
        }
    };

    // Container classes
    const containerClasses = themedClasses(
        "flex-row items-center",
        "flex-row items-center"
    );

    // Checkbox box classes
    const boxClasses = themedClasses(
        `w-5 h-5 items-center justify-center rounded border ${checked ? 'bg-primary-light border-primary-light' : 'bg-white border-gray-300'} ${disabled ? 'opacity-50' : ''}`,
        `w-5 h-5 items-center justify-center rounded border ${checked ? 'bg-primary-dark border-primary-dark' : 'bg-gray-800 border-gray-600'} ${disabled ? 'opacity-50' : ''}`
    );

    // Combined classes
    const containerClassName = `${containerClasses} ${className}`;

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.9}
            className={containerClassName}
            style={style}
            disabled={disabled}
            {...props}
        >
            <Animated.View
                className={boxClasses}
                style={{ transform: [{ scale: scaleAnim }] }}
            >
                {checked && (
                    <Ionicons
                        name="checkmark"
                        size={16}
                        color="white"
                    />
                )}
            </Animated.View>

            {label && (
                <Text
                    variant="body"
                    color={disabled ? (isDarkMode ? '#6B7280' : '#9CA3AF') : undefined}
                    className="ml-2"
                >
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default Checkbox;