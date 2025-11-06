import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { Text } from '@/components/ui';
import { ScreenContainer } from '@/components/layout';

const Description = ({ boardingHouse, t }) => {
    const [expanded, setExpanded] = useState(false);
    const { isDarkMode } = useTheme();

    // Memoize calculated values to prevent unnecessary re-calculations
    const shouldShowExpandButton = useMemo(() => {
        return boardingHouse?.description &&
            boardingHouse.description.split(" ").length > 50;
    }, [boardingHouse?.description]);

    const description = useMemo(() => {
        return boardingHouse?.description || t("noDescriptionAvailable");
    }, [boardingHouse?.description, t]);

    const toggleExpanded = () => setExpanded(prev => !prev);

    return (
        <View
            className={`
                ${isDarkMode ? 'bg-background-dark' : 'bg-background-light'}
                mt-10
            `}

        >
            <Text
                variant="subtitle"
                weight="bold"
            >
                {t("description")}
            </Text>

            {/* Description Container */}
            <View className={`
                p-4 
                rounded-lg 
                mt-3
                ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
            `}>
                {/* Text Container */}
                <View className={`
                    ${!expanded ? 'max-h-60 overflow-hidden' : ''}
                `}>
                    <Text className={`
                        leading-relaxed 
                        text-justify
                        ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}
                     `}

                    >
                        {description}
                    </Text>
                </View>

                {/* Expand/Collapse Button */}
                {shouldShowExpandButton && (
                    <View className="mt-3">
                        <TouchableOpacity
                            onPress={toggleExpanded}
                            className="self-start"
                            activeOpacity={0.7}
                        >
                            <Text className={`
                                text-sm sm:text-base lg:text-lg
                                underline
                                ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}
                            `}>
                                {expanded ? t("collapse") : t("showMore")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

export default Description;