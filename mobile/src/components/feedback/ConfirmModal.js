import React, { useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Animated,
    Dimensions,
    StyleSheet
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeProvider';
import { useThemedClasses } from '@/utils/useTheme';
import { useTranslation } from 'react-i18next';

const { height } = Dimensions.get('window');

const ConfirmModal = ({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    confirmColor = "#3b82f6", // Default blue-500
    dangerMode = false,
    warningMode = false,
}) => {
    const { themedClasses } = useThemedClasses();
    const slideAnim = useRef(new Animated.Value(height)).current;
    const { t } = useTranslation('feedbackComponent');

    // Set default texts using translations
    const defaultTitle = t('confirm_title', 'Confirm');
    const defaultMessage = t('confirm_message', 'Are you sure you want to perform this action?');
    const defaultConfirmText = t('ok_btn', 'OK');
    const defaultCancelText = t('cancel_btn', 'Cancel');

    // Use provided texts or fallback to translated defaults
    const modalTitle = title || defaultTitle;
    const modalMessage = message || defaultMessage;
    const modalConfirmText = confirmText || defaultConfirmText;
    const modalCancelText = cancelText || defaultCancelText;

    // Determine confirm button color and icon based on mode
    const getConfirmColor = () => {
        if (dangerMode) return '#ef4444'; // red-500
        if (warningMode) return '#f59e0b'; // amber-500
        return confirmColor;
    };

    const getIconName = () => {
        if (dangerMode) return 'exclamation-triangle';
        if (warningMode) return 'exclamation-circle';
        return 'question-circle';
    };

    const finalConfirmColor = getConfirmColor();
    const iconName = getIconName();

    useEffect(() => {
        if (visible) {
            // Slide in animation
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleClose = () => {
        // Slide out animation before closing
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onClose && onClose();
        });
    };

    const handleConfirm = () => {
        // Slide out animation before closing
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onConfirm && onConfirm();
            onClose && onClose();
        });
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={handleClose}
        >
            <View className="flex-1 justify-center items-center bg-black/40">
                <Animated.View
                    style={[
                        { transform: [{ translateY: slideAnim }] },
                        styles.confirmContainer
                    ]}
                    className={themedClasses(
                        "w-11/12 max-w-md rounded-xl bg-card-light shadow-xl overflow-hidden",
                        "w-11/12 max-w-md rounded-xl bg-card-dark shadow-xl overflow-hidden"
                    )}
                >
                    {/* Modal Header */}
                    <View
                        style={{ backgroundColor: finalConfirmColor }}
                        className="px-4 py-3 flex-row justify-between items-center"
                    >
                        <View className="flex-row items-center">
                            <FontAwesome
                                name={iconName}
                                size={20}
                                color="white"
                            />
                            <Text className="text-white font-bold text-lg ml-2">{modalTitle}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <FontAwesome name="times" size={18} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Modal Content */}
                    <View className="p-4">
                        <Text
                            className={themedClasses(
                                "text-text-light text-base",
                                "text-text-dark text-base"
                            )}
                        >
                            {modalMessage}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="px-4 pb-4 flex-row justify-end">
                        <TouchableOpacity
                            onPress={handleClose}
                            className={themedClasses(
                                "px-4 py-2 rounded-lg bg-gray-300 mr-3",
                                "px-4 py-2 rounded-lg bg-gray-700 mr-3"
                            )}
                        >
                            <Text
                                className={themedClasses(
                                    "text-gray-800 font-medium",
                                    "text-gray-200 font-medium"
                                )}
                            >
                                {modalCancelText}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleConfirm}
                            style={{ backgroundColor: finalConfirmColor }}
                            className="px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white font-medium">{modalConfirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    confirmContainer: {
        elevation: 5,
    },
});

export default ConfirmModal;