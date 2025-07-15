import React, { useRef } from 'react';
import { View, TouchableOpacity, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemedClasses } from '@/utils/useTheme';
import Text from '../ui/Text';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Custom header component with back button and optional right content
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

  // Animated values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;

  const headerClasses = themedClasses(
    'flex-row items-center justify-between py-4 px-4',
    'flex-row items-center justify-between py-4 px-4'
  );
  const bgClasses = themedClasses('bg-background-light', 'bg-background-dark');

  const fullHeaderClassName = `${headerClasses} ${bgClasses} ${className}`;

  const navigateBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const runAnimation = (animations, callback) => {
    Animated.sequence(animations).start(callback);
  };

  const handleBackPress = () => {
    switch (animationType) {
      case 'scale':
        runAnimation(
          [
            Animated.timing(scaleAnim, {
              toValue: 0.8,
              duration: 100,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 100,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ],
          navigateBack
        );
        break;

      case 'fade':
        runAnimation(
          [
            Animated.timing(opacityAnim, {
              toValue: 0.5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ],
          navigateBack
        );
        break;

      case 'slide':
        runAnimation(
          [
            Animated.timing(translateXAnim, {
              toValue: 5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(translateXAnim, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ],
          navigateBack
        );
        break;

      case 'ripple':
      default:
        navigateBack();
    }
  };

  const renderBackIcon = () => backIcon || <DefaultBackIcon />;

  return (
    <View className={fullHeaderClassName} style={style} {...props}>
      <View className="flex-row items-center">
        {showBack && (
          <AnimatedTouchable
            className={`mr-3 p-1 ${backButtonClassName}`}
            style={[
              backButtonStyle,
              {
                transform: [
                  { scale: animationType === 'scale' ? scaleAnim : 1 },
                  {
                    translateX: animationType === 'slide' ? translateXAnim : 0,
                  },
                ],
                opacity: animationType === 'fade' ? opacityAnim : 1,
              },
            ]}
            onPress={handleBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={animationType === 'ripple' ? 0.5 : 0.9}
          >
            {renderBackIcon()}
          </AnimatedTouchable>
        )}
        <Text variant="h4" weight="semibold">
          {title}
        </Text>
      </View>

      {rightComponent && <View>{rightComponent}</View>}
    </View>
  );
};

// Default back icon if none is provided
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
          borderRadius: 1,
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
          borderRadius: 1,
        }}
      />
    </View>
  );
};

/**
 * BackHeader - simplified header with back button and title
 */
export const BackHeader = ({
  title,
  backIcon,
  onBackPress,
  animationType = 'scale',
  backButtonStyle,
  backButtonClassName,
  ...props
}) => (
  <CustomHeader
    title={title}
    showBack
    backIcon={backIcon}
    onBackPress={onBackPress}
    animationType={animationType}
    backButtonStyle={backButtonStyle}
    backButtonClassName={backButtonClassName}
    {...props}
  />
);

export default CustomHeader;
