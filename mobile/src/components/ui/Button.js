import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { useThemedClasses } from '@/utils/useTheme';
import PropTypes from 'prop-types';

/**
 * CustomButton component with support for different variants, states, and icons
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
 * @param {ReactNode} icon - icon component to display
 * @param {string} iconPosition - left, right
 * @param {object} iconStyle - additional style for the icon
 * @param {string} iconClassName - additional className for the icon
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
    icon,
    iconPosition = 'left',
    iconStyle,
    iconClassName = '',
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

    // Icon spacing classes based on size
    const iconSpacingClasses = {
        sm: children ? "mx-1" : "mx-0",
        md: children ? "mx-2" : "mx-0",
        lg: children ? "mx-2" : "mx-0"
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

    // Icon component with styling
    const IconComponent = icon ? (
        <View className={`${iconSpacingClasses[size]} ${iconClassName}`} style={iconStyle}>
            {icon}
        </View>
    ) : null;

    // Render content based on icon position
    const renderContent = () => {
        if (loading) {
            return (
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
            );
        }

        if (!icon) {
            return (
                <Text className={finalTextClassName} style={textStyle}>
                    {children}
                </Text>
            );
        }

        // With icon
        return (
            <View className="flex-row items-center">
                {iconPosition === 'left' && IconComponent}
                {children && (
                    <Text className={finalTextClassName} style={textStyle}>
                        {children}
                    </Text>
                )}
                {iconPosition === 'right' && IconComponent}
            </View>
        );
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            className={buttonClassName}
            style={style}
            {...props}
        >
            {renderContent()}
        </TouchableOpacity>
    );
};

Button.propTypes = {
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'text']),
    fullWidth: PropTypes.bool,
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    onPress: PropTypes.func,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    children: PropTypes.node,
    style: PropTypes.object,
    textStyle: PropTypes.object,
    className: PropTypes.string,
    textClassName: PropTypes.string,
    icon: PropTypes.node,
    iconPosition: PropTypes.oneOf(['left', 'right']),
    iconStyle: PropTypes.object,
    iconClassName: PropTypes.string
};

Button.defaultProps = {
    variant: 'primary',
    fullWidth: false,
    loading: false,
    disabled: false,
    size: 'md',
    className: '',
    textClassName: '',
    iconPosition: 'left',
    iconClassName: ''
};

export default Button;