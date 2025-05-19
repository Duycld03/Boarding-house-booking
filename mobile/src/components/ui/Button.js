import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { useThemedClasses } from '@/utils/useTheme';

/**
 * CustomButton component with support for different variants and states
 * @param {string} variant - primary, secondary, outline, text
 * @param {boolean} fullWidth - whether the button should take full width
 * @param {boolean} loading - shows loading spinner when true
 * @param {boolean} disabled - disables the button when true
 * @param {function} onPress - function to call when button is pressed
 * @param {string} size - sm, md, lg
 * @param {ReactNode} children - button text or content
 * @param {object} style - additional style for the button
 * @param {object} textStyle - additional style for the button text
 * @param {string} className - additional className for the button (for tailwind)
 * @param {string} textClassName - additional className for the text (for tailwind)
 */
const Button = ({
    variant = 'primary',
    fullWidth = false,
    loading = false,
    disabled = false,
    onPress,
    size = 'md',
    children,
    style,
    textStyle,
    className = '',
    textClassName = '',
    ...props
}) => {
    const { themedClasses } = useThemedClasses();

    // Base classes for all buttons
    const baseButtonClasses = themedClasses(
        "items-center justify-center rounded-xl",
        "items-center justify-center rounded-xl"
    );

    // Size classes
    const sizeClasses = {
        sm: "py-2 px-4",
        md: "py-3 px-5",
        lg: "py-4 px-6"
    };

    // Width classes
    const widthClasses = fullWidth ? "w-full" : "w-auto";

    // Variant specific classes
    const variantClasses = {
        primary: themedClasses(
            "bg-primary-light",
            "bg-primary-dark"
        ),
        secondary: themedClasses(
            "bg-secondary-light",
            "bg-secondary-dark"
        ),
        outline: themedClasses(
            "bg-transparent border border-primary-light",
            "bg-transparent border border-primary-dark"
        ),
        text: themedClasses(
            "bg-transparent",
            "bg-transparent"
        )
    };

    // Text classes based on variant
    const textClasses = {
        primary: themedClasses(
            "text-white font-semibold",
            "text-white font-semibold"
        ),
        secondary: themedClasses(
            "text-white font-semibold",
            "text-white font-semibold"
        ),
        outline: themedClasses(
            "text-primary-light font-semibold",
            "text-primary-dark font-semibold"
        ),
        text: themedClasses(
            "text-primary-light font-semibold",
            "text-primary-dark font-semibold"
        )
    };

    // Disabled classes
    const disabledClasses = disabled || loading ?
        themedClasses(
            "opacity-50",
            "opacity-50"
        ) : "";

    // Combining all classes
    const buttonClassName = `${baseButtonClasses} ${sizeClasses[size]} ${widthClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`;

    // Handling text size based on button size
    const textSize = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg"
    };

    // Combine text classes without redefining textClassName
    const finalTextClassName = `${textClasses[variant]} ${textSize[size]} ${textClassName}`;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            className={buttonClassName}
            style={style}
            {...props}
        >
            {loading ? (
                <View className="flex-row items-center">
                    <ActivityIndicator
                        size="small"
                        color={variant === 'outline' || variant === 'text' ?
                            themedClasses("#0073e6", "#3b82f6") : "#ffffff"}
                        className="mr-2"
                    />
                    {children && (
                        <Text className={finalTextClassName} style={textStyle}>
                            {children}
                        </Text>
                    )}
                </View>
            ) : (
                <Text className={finalTextClassName} style={textStyle}>
                    {children}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default Button;