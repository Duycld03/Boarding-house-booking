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

const { height } = Dimensions.get('window');

const NotificationModal = ({
    visible,
    onClose,
    title = "Notification",
    message,
    type = "info", // "success", "error", "warning", "info"
    autoClose = true,
    duration = 3000
}) => {
    const { isDarkMode } = useTheme();
    const { themedClasses } = useThemedClasses();
    const slideAnim = useRef(new Animated.Value(height)).current;

    const notificationConfig = {
        success: {
            icon: 'check-circle',
            color: '#10b981',
        },
        error: {
            icon: 'times-circle',
            color: '#ef4444',
        },
        warning: {
            icon: 'exclamation-circle',
            color: '#f59e0b',
        },
        info: {
            icon: 'info-circle',
            color: isDarkMode ? '#60a5fa' : '#3b82f6',
        },
    };

    const { icon, color } = notificationConfig[type] || notificationConfig.info;

    useEffect(() => {
        if (visible) {
            // Slide in animation
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Auto close after duration if enabled
            if (autoClose) {
                const timer = setTimeout(() => {
                    handleClose();
                }, duration);

                return () => clearTimeout(timer);
            }
        }
    }, [visible]);

    const handleClose = () => {
        // Slide out animation before actually closing
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
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
                        styles.notificationContainer
                    ]}
                    className={themedClasses(
                        "w-11/12 max-w-md rounded-xl bg-card-light shadow-xl overflow-hidden",
                        "w-11/12 max-w-md rounded-xl bg-card-dark shadow-xl overflow-hidden"
                    )}
                >
                    {/* Notification Header */}
                    <View
                        style={{ backgroundColor: color }}
                        className="px-4 py-3 flex-row justify-between items-center"
                    >
                        <View className="flex-row items-center">
                            <FontAwesome name={icon} size={20} color="white" />
                            <Text className="text-white font-bold text-lg ml-2">{title}</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <FontAwesome name="times" size={18} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Notification Content */}
                    <View className="p-4">
                        <Text
                            className={themedClasses(
                                "text-text-light text-base",
                                "text-text-dark text-base"
                            )}
                        >
                            {message}
                        </Text>
                    </View>

                    {/* Action Button (optional) */}
                    <View className="px-4 pb-4 flex-row justify-end">
                        <TouchableOpacity
                            onPress={handleClose}
                            className={themedClasses(
                                "px-4 py-2 rounded-lg bg-primary-light",
                                "px-4 py-2 rounded-lg bg-primary-dark"
                            )}
                        >
                            <Text className="text-white font-medium">OK</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    notificationContainer: {
        elevation: 5,
    },
});

export default NotificationModal;