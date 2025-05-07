import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useThemedClasses } from '@/utils/useTheme';

/**
 * Card component with consistent styling and theming
 * @param {ReactNode} children - card content
 * @param {string} variant - flat, elevated, outline
 * @param {object} style - additional style for the card
 * @param {string} className - additional className for the card
 */
const Card = ({
    children,
    variant = 'elevated',
    style,
    className = '',
    ...props
}) => {
    const { themedClasses } = useThemedClasses();

    // Base classes for all cards
    const baseClasses = themedClasses(
        "rounded-xl overflow-hidden",
        "rounded-xl overflow-hidden"
    );

    // Variant specific classes
    const variantClasses = {
        elevated: themedClasses(
            "bg-white shadow-md",
            "bg-gray-800 shadow-md"
        ),
        flat: themedClasses(
            "bg-white",
            "bg-gray-800"
        ),
        outline: themedClasses(
            "bg-white border border-gray-200",
            "bg-gray-800 border border-gray-700"
        ),
    };

    // Combine classes
    const cardClassName = `${baseClasses} ${variantClasses[variant]} ${className}`;

    return (
        <View
            className={cardClassName}
            style={style}
            {...props}
        >
            {children}
        </View>
    );
};

/**
 * PressableCard component - a touchable version of Card
 * @param {ReactNode} children - card content
 * @param {string} variant - flat, elevated, outline
 * @param {function} onPress - function to call when card is pressed
 * @param {object} style - additional style for the card
 * @param {string} className - additional className for the card
 */
export const PressableCard = ({
    children,
    variant = 'elevated',
    onPress,
    style,
    className = '',
    ...props
}) => {
    const { themedClasses } = useThemedClasses();

    // Base classes for all cards
    const baseClasses = themedClasses(
        "rounded-xl overflow-hidden",
        "rounded-xl overflow-hidden"
    );

    // Variant specific classes
    const variantClasses = {
        elevated: themedClasses(
            "bg-white shadow-md",
            "bg-gray-800 shadow-md"
        ),
        flat: themedClasses(
            "bg-white",
            "bg-gray-800"
        ),
        outline: themedClasses(
            "bg-white border border-gray-200",
            "bg-gray-800 border border-gray-700"
        ),
    };

    // Combine classes
    const cardClassName = `${baseClasses} ${variantClasses[variant]} ${className}`;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={cardClassName}
            style={style}
            {...props}
        >
            {children}
        </TouchableOpacity>
    );
};

export default Card;