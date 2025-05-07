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

const ConfirmModal = ({
    visible,
    onClose,
    onConfirm,
    title = "Xác nhận",
    message = "Bạn có chắc chắn muốn thực hiện hành động này?",
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    confirmColor = "#3b82f6", // Màu mặc định là blue-500
    dangerMode = false,
}) => {
    const { isDarkMode } = useTheme();
    const { themedClasses } = useThemedClasses();
    const slideAnim = useRef(new Animated.Value(height)).current;

    // Xác định màu nút xác nhận dựa vào dangerMode
    const finalConfirmColor = dangerMode ? '#ef4444' : confirmColor;

    useEffect(() => {
        if (visible) {
            // Hiệu ứng trượt vào
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleClose = () => {
        // Hiệu ứng trượt ra trước khi đóng
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onClose && onClose();
        });
    };

    const handleConfirm = () => {
        // Hiệu ứng trượt ra trước khi đóng
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
                                name={dangerMode ? "exclamation-triangle" : "question-circle"}
                                size={20}
                                color="white"
                            />
                            <Text className="text-white font-bold text-lg ml-2">{title}</Text>
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
                            {message}
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
                                {cancelText}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleConfirm}
                            style={{ backgroundColor: finalConfirmColor }}
                            className="px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white font-medium">{confirmText}</Text>
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