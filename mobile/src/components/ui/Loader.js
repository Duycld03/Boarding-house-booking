import { ActivityIndicator, View, Text } from "react-native";
import { useTranslation } from "react-i18next";

function Loader({
    size = "large",
    color = "#3B82F6",
    text,
    showText = true,
    overlay = false
}) {
    const { t } = useTranslation('common');

    // Sử dụng text được truyền vào hoặc fallback về translation
    const displayText = text || t('loaderComponent.loading');
    if (overlay) {
        return (
            <View className="absolute inset-0 bg-black/50 flex-1 justify-center items-center z-50">
                <View className="bg-white rounded-lg p-6 items-center shadow-lg">
                    <ActivityIndicator size={size} color={color} />
                    {showText && (
                        <Text className="mt-3 text-gray-700 text-base font-medium">
                            {displayText}
                        </Text>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 justify-center items-center bg-gray-50">
            <ActivityIndicator size={size} color={color} />
            {showText && (
                <Text className="mt-3 text-gray-600 text-base">
                    {displayText}
                </Text>
            )}
        </View>
    );
}

export default Loader;