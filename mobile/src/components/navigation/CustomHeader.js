import React, { useRef } from 'react';
import { View, TouchableOpacity, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemedClasses } from '@/utils/useTheme';
import Text from '../ui/Text';

/**
 * Custom header component with back button option and customizable styling
 * @param {string} title - header title
 * @param {boolean} showBack - whether to show back button
 * @param {ReactNode} rightComponent - component to render on the right side
 * @param {ReactNode} backIcon - custom back icon component
 * @param {function} onBackPress - custom function to call when back button is pressed
 * @param {object} style - additional style for the header
 * @param {string} className - additional className for the header
 * @param {string} animationType - type of animation for back button ("scale" | "fade" | "slide" | "ripple")
 * @param {object} backButtonStyle - additional style for back button
 * @param {string} backButtonClassName - additional className for back button
 */
const CustomHeader = ({
    title,
    showBack = false,
    rightComponent,
    backIcon,
    onBackPress,
    style,
    className = '',
    animationType = 'scale',
    backButtonStyle,
    backButtonClassName = '',
    ...props
}) => {
    const { themedClasses } = useThemedClasses();
    const router = useRouter();

    // Animation values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;
    const translateXAnim = useRef(new Animated.Value(0)).current;

    const headerClasses = themedClasses(
        "flex-row items-center justify-between py-4 px-4",
        "flex-row items-center justify-between py-4 px-4"
    );

    // Background color
    const bgClasses = themedClasses(
        "bg-background-light",
        "bg-background-dark"
    );

    const headerClassName = `${headerClasses} ${bgClasses} ${className}`;

    const handleBackPress = () => {
        // Animate the button based on selected animation type
        switch (animationType) {
            case 'scale':
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 0.8,
                        duration: 100,
                        useNativeDriver: true,
                        easing: Easing.out(Easing.ease)
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                        easing: Easing.in(Easing.ease)
                    })
                ]).start(() => {
                    if (onBackPress) {
                        onBackPress();
                    } else {
                        router.back();
                    }
                });
                break;

            case 'fade':
                Animated.sequence([
                    Animated.timing(opacityAnim, {
                        toValue: 0.5,
                        duration: 100,
                        useNativeDriver: true
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true
                    })
                ]).start(() => {
                    if (onBackPress) {
                        onBackPress();
                    } else {
                        router.back();
                    }
                });
                break;

            case 'slide':
                Animated.sequence([
                    Animated.timing(translateXAnim, {
                        toValue: 5,
                        duration: 100,
                        useNativeDriver: true
                    }),
                    Animated.timing(translateXAnim, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true
                    })
                ]).start(() => {
                    if (onBackPress) {
                        onBackPress();
                    } else {
                        router.back();
                    }
                });
                break;

            case 'ripple':
                // For ripple effect, we just use the TouchableOpacity's activeOpacity
                if (onBackPress) {
                    onBackPress();
                } else {
                    router.back();
                }
                break;

            default:
                // No animation, just execute the action
                if (onBackPress) {
                    onBackPress();
                } else {
                    router.back();
                }
        }
    };

    // Render the back icon - either custom or default
    const renderBackIcon = () => {
        if (backIcon) {
            return backIcon;
        }
        return <DefaultBackIcon />;
    };

    return (
        <View className={headerClassName} style={style} {...props}>
            <View className="flex-row items-center">
                {showBack && (
                    <TouchableOpacity
                        onPress={handleBackPress}
                        className={`mr-3 p-1 ${backButtonClassName}`}
                        style={backButtonStyle}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        activeOpacity={animationType === 'ripple' ? 0.5 : 0.9}
                    >
                        <Animated.View style={{
                            transform: [
                                { scale: animationType === 'scale' ? scaleAnim : 1 },
                                { translateX: animationType === 'slide' ? translateXAnim : 0 }
                            ],
                            opacity: animationType === 'fade' ? opacityAnim : 1
                        }}>
                            {renderBackIcon()}
                        </Animated.View>
                    </TouchableOpacity>
                )}

                <Text variant="h4" weight="semibold">
                    {title}
                </Text>
            </View>

            {rightComponent && (
                <View>
                    {rightComponent}
                </View>
            )}
        </View>
    );
};

// Default back arrow icon
const DefaultBackIcon = () => {
    const { themedClasses } = useThemedClasses();
    const arrowColor = themedClasses('#000000', '#ffffff');

    return (
        <View style={{ width: 24, height: 24 }}>
            <View
                style={{
                    width: 14,
                    height: 2,
                    backgroundColor: arrowColor,
                    position: 'absolute',
                    top: 11,
                    left: 4,
                    transform: [{ rotate: '45deg' }],
                    borderRadius: 1
                }}
            />
            <View
                style={{
                    width: 14,
                    height: 2,
                    backgroundColor: arrowColor,
                    position: 'absolute',
                    top: 11,
                    left: 4,
                    transform: [{ rotate: '-45deg' }],
                    borderRadius: 1
                }}
            />
        </View>
    );
};

/**
 * BackHeader - a simplified header with back button and title
 * @param {string} title - header title
 * @param {ReactNode} backIcon - custom back icon component
 * @param {function} onBackPress - custom function to call when back button is pressed
 * @param {string} animationType - type of animation for back button
 * @param {object} backButtonStyle - additional style for back button
 * @param {string} backButtonClassName - additional className for back button
 */
export const BackHeader = ({
    title,
    backIcon,
    onBackPress,
    animationType = 'scale',
    backButtonStyle,
    backButtonClassName,
    ...props
}) => {
    return (
        <CustomHeader
            title={title}
            showBack={true}
            backIcon={backIcon}
            onBackPress={onBackPress}
            animationType={animationType}
            backButtonStyle={backButtonStyle}
            backButtonClassName={backButtonClassName}
            {...props}
        />
    );
};

export default CustomHeader;