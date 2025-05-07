import React from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedClasses } from '@/utils/useTheme';

/**
 * ScreenContainer component that applies safe areas and consistent styling
 * @param {ReactNode} children - screen content
 * @param {boolean} scroll - whether content should be scrollable
 * @param {boolean} keyboardAvoiding - whether to avoid keyboard
 * @param {array} edges - safe area edges to apply
 * @param {boolean} withPadding - whether to add standard horizontal padding
 * @param {object} style - additional style for the container
 * @param {string} className - additional className for the container
 */
const ScreenContainer = ({
    children,
    edges = ['top', 'left', 'right'],
    withPadding = true,
    style,
    className = '',
    ...props
}) => {
    const { themedClasses } = useThemedClasses();

    // Base container classes
    const containerClasses = themedClasses(
        `flex-1 ${withPadding ? 'px-4' : ''}`,
        `flex-1 ${withPadding ? 'px-4' : ''}`
    );

    // Background color classes
    const bgClasses = themedClasses(
        "bg-background-light",
        "bg-background-dark"
    );

    // Combine classes
    const fullContainerClass = `${containerClasses} ${bgClasses} ${className}`;

    return (
        <SafeAreaView
            edges={edges}
            className={fullContainerClass}
            style={style}
            {...props}
        >
            {children}
        </SafeAreaView>
    );
};

/**
 * ScrollContainer component that makes content scrollable with keyboard avoiding
 * @param {ReactNode} children - screen content
 * @param {boolean} keyboardAvoiding - whether to avoid keyboard
 * @param {object} contentContainerStyle - style for the scroll content container
 * @param {string} className - additional className for the container
 * @param {string} contentClassName - additional className for the content container
 */
export const ScrollContainer = ({
    children,
    keyboardAvoiding = true,
    contentContainerStyle,
    className = '',
    contentClassName = '',
    ...props
}) => {

    // If keyboard avoiding is enabled
    if (keyboardAvoiding) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className={`flex-1 ${className}`}
                {...props}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerClassName={`grow ${contentClassName}`}
                    contentContainerStyle={contentContainerStyle}
                    keyboardShouldPersistTaps="handled"
                >
                    {children}
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    return (
        <ScrollView
            className={`flex-1 ${className}`}
            contentContainerClassName={contentClassName}
            contentContainerStyle={contentContainerStyle}
            keyboardShouldPersistTaps="handled"
            {...props}
        >
            {children}
        </ScrollView>
    );
};

export default ScreenContainer;