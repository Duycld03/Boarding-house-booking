import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { useThemedClasses } from '@/utils/useTheme';

/**
 * CustomText component with support for different variants and font weights
 * @param {string} variant - h1, h2, h3, h4, subtitle, body, caption, label
 * @param {string} weight - thin, light, regular, medium, semibold, bold, extrabold, black
 * @param {string} align - left, center, right
 * @param {string} color - override text color
 * @param {boolean} muted - apply muted text styling
 * @param {boolean} contrast - apply high contrast text styling
 * @param {ReactNode} children - text content
 * @param {object} style - additional style for the text
 * @param {string} className - additional className for the text (for tailwind)
 */
const Text = ({
    variant = 'body',
    weight = 'regular',
    align = 'left',
    color,
    muted = false,
    contrast = false,
    children,
    style,
    className = '',
    ...props
}) => {
    const { themedClasses, isDarkMode } = useThemedClasses();

    const fontWeights = {
        thin: "Poppins-Thin",
        light: "Poppins-Light",
        regular: "Poppins-Regular",
        medium: "Poppins-Medium",
        semibold: "Poppins-SemiBold",
        bold: "Poppins-Bold",
        extrabold: "Poppins-ExtraBold",
        black: "Poppins-Black"
    };

    const variantClasses = {
        h1: "text-4xl",
        h2: "text-3xl",
        h3: "text-2xl",
        h4: "text-xl",
        subtitle: "text-lg",
        body: "text-base",
        caption: "text-sm",
        label: "text-xs"
    };

    const alignClasses = {
        left: "text-left",
        center: "text-center",
        right: "text-right"
    };

    let colorClass = '';

    let textColor;

    if (color) {
        textColor = color;
        colorClass = '';
    } else if (muted) {
        colorClass = themedClasses(
            "text-text-muted-light",
            "text-text-muted-dark"
        );
        textColor = isDarkMode ? '#9CA3AF' : '#6B7280';
    } else if (contrast) {
        colorClass = themedClasses(
            "text-text-contrast-light",
            "text-text-contrast-dark"
        );
        textColor = isDarkMode ? '#FFFFFF' : '#000000';
    } else {
        // Default text colors
        colorClass = themedClasses(
            "text-text-light",
            "text-text-dark"
        );
        textColor = isDarkMode ? '#E5E7EB' : '#1F2937';
    }

    const textClassName = `${variantClasses[variant]} ${alignClasses[align]} ${colorClass} ${className}`;

    const fontStyle = {
        fontFamily: fontWeights[weight],
        color: textColor,
    };

    const isHeading = ['h1', 'h2', 'h3', 'h4'].includes(variant);
    const shadowStyle = isHeading && isDarkMode ? {
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    } : {};

    return (
        <RNText
            className={textClassName}
            style={[fontStyle, shadowStyle, style]}
            {...props}
        >
            {children}
        </RNText>
    );
};

export default Text;