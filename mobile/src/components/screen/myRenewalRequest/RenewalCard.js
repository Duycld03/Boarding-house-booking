import React from "react";
import { Text, Line } from "@/components/ui";
import { View, TouchableOpacity } from "react-native";
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import convertTimetap from "@/utils/convertTimetap";

// Status colors mapping
const statusColors = {
    pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-600 dark:text-yellow-400",
        border: "border-yellow-200 dark:border-yellow-800"
    },
    accepted: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-200 dark:border-green-800"
    },
    rejected: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-800"
    }
};
//Color status text
const statusTextColor = {
    pending: '#F59E0B',
    accepted: '#10B981',
    rejected: '#EF4444'
};

function RenewalCard({
    count,
    renewal,
    isDarkMode,
    themedClasses,
}) {
    const { t } = useTranslation("myRenewalRequest");

    // Extract data from renewal object
    const roomNumber = renewal?.roomId?.roomNumber || "N/A";
    const boardingHouseName = renewal?.roomId?.boardingHouseId?.name || "N/A";
    const currentEndDate = convertTimetap(renewal?.currentEndDate);
    const requestedEndDate = convertTimetap(renewal?.requestedEndDate);
    const status = renewal?.status?.toLowerCase() || "pending";
    const tenantNote = renewal?.tenantNote || "No notes";
    const ownerNote = renewal?.reasonForCancel || "No response yet";

    // Get status styles
    const getStatusStyles = (status) => {
        return statusColors[status] || statusColors.pending;
    };

    const statusStyle = getStatusStyles(status);

    return (
        <TouchableOpacity
            className={`mx-4 mb-4 rounded-xl shadow-sm ${themedClasses(
                "bg-white",
                "bg-gray-800"
            )} ${themedClasses("border border-gray-200", "border-gray-700")}`}
            activeOpacity={0.7}
        >
            {/* Header Section with Boarding House and Room */}
            <View className="p-4">
                <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                        <Text variant="h4" weight="semibold">
                            #{count}. {boardingHouseName}
                        </Text>
                        <Text
                            className={`text-sm mt-1 ${themedClasses(
                                "text-gray-500",
                                "text-gray-400"
                            )}`}
                        >
                            {t("room")}: {roomNumber}
                        </Text>
                    </View>

                    {/* Status Badge */}
                    <View
                        className={`px-3 py-1 rounded-full ${statusStyle.bg} border ${statusStyle.border}`}
                    >
                        <Text
                            variant="label"
                            weight="medium"
                            className={`capitalize ${statusStyle.text}`}
                            style={{
                                color: statusTextColor[status] || statusTextColor.pending,
                            }}
                        >
                            {t(`status.${status}`) || status}
                        </Text>
                    </View>
                </View>
            </View>

            <Line thickness={2} />

            {/* Renewal Details Section */}
            <View className="p-4 space-y-3">
                {/* Date Section */}
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <View
                            className={`p-2 rounded-full mr-3 ${isDarkMode ? "bg-blue-900/30" : "bg-blue-100"}`}
                            style={{ borderRadius: 9999 }}
                        >
                            <MaterialCommunityIcons
                                name="calendar"
                                size={14}
                                color={isDarkMode ? "#60a5fa" : "#3b82f6"}
                            />
                        </View>
                        <Text
                            className={themedClasses("text-gray-700", "text-gray-300")}
                        >
                            {t("previousEndDate")}
                        </Text>
                    </View>
                    <Text
                        className={themedClasses(
                            "font-semibold text-gray-800",
                            "font-semibold text-gray-100"
                        )}
                    >
                        {currentEndDate}
                    </Text>
                </View>

                {/* New End Date Section */}
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <View
                            className={`p-2 rounded-full mr-3 ${isDarkMode ? "bg-green-900/30" : "bg-green-100"}`}
                            style={{ borderRadius: 9999 }}
                        >
                            <MaterialCommunityIcons
                                name="calendar-refresh"
                                size={14}
                                color={isDarkMode ? "#4ade80" : "#22c55e"}
                            />
                        </View>
                        <Text
                            className={themedClasses("text-gray-700", "text-gray-300")}
                        >
                            {t("requestedExtensionDate")}
                        </Text>
                    </View>
                    <Text
                        className={themedClasses(
                            "font-semibold text-gray-800",
                            "font-semibold text-gray-100"
                        )}
                    >
                        {requestedEndDate}
                    </Text>
                </View>

                {/* Tenant Note Section */}
                <View>
                    <View className="flex-row items-center mb-1">
                        <View
                            className={`p-2 rounded-full mr-3 ${isDarkMode ? "bg-yellow-900/30" : "bg-yellow-100"}`}
                            style={{ borderRadius: 9999 }}
                        >
                            <MaterialIcons
                                name="note"
                                size={14}
                                color={isDarkMode ? "#fcd34d" : "#f59e0b"}
                            />
                        </View>
                        <Text
                            className={themedClasses("text-gray-700", "text-gray-300")}
                        >
                            {t("tenantNote")} {": "}
                        </Text>
                    </View>
                    <Text
                        className={`ml-9 ${themedClasses(
                            "text-gray-600",
                            "text-gray-400"
                        )}`}
                        numberOfLines={2}
                    >
                        {tenantNote}
                    </Text>
                </View>

                {/* Owner Note Section - Only show if there's an owner note or status is not pending */}
                {(ownerNote !== "No response yet" || status !== "pending") && (
                    <View>
                        <View className="flex-row items-center mb-1">
                            <View
                                className={`p-2 rounded-full mr-3 ${isDarkMode ? "bg-purple-900/30" : "bg-purple-100"}`}
                                style={{ borderRadius: 9999 }}
                            >
                                <MaterialIcons
                                    name="comment"
                                    size={14}
                                    color={isDarkMode ? "#c084fc" : "#a855f7"}
                                />
                            </View>
                            <Text
                                className={themedClasses("text-gray-700", "text-gray-300")}
                            >
                                {t("ownerNote")} {": "}
                            </Text>
                        </View>
                        <Text
                            className={`ml-9 ${themedClasses(
                                "text-gray-600",
                                "text-gray-400"
                            )}`}
                            numberOfLines={2}
                        >
                            {ownerNote}
                        </Text>
                    </View>
                )}
            </View>

        </TouchableOpacity>
    );
}

export default RenewalCard;