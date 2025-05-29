import { View, Text, Image } from "react-native";
import { useState } from "react";

function Avatar({
    source,
    size = "md",
    fallbackText,
    showOnlineStatus = false,
    isOnline = false,
    borderColor = "border-gray-200",
    className = ""
}) {
    const [imageError, setImageError] = useState(false);

    // Định nghĩa các size
    const sizeClasses = {
        xs: "w-6 h-6",
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-20 h-20",
        "2xl": "w-24 h-24"
    };

    const textSizeClasses = {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl",
        "2xl": "text-2xl"
    };

    const onlineIndicatorSizes = {
        xs: "w-1.5 h-1.5",
        sm: "w-2 h-2",
        md: "w-2.5 h-2.5",
        lg: "w-3 h-3",
        xl: "w-3.5 h-3.5",
        "2xl": "w-4 h-4"
    };

    // Tạo fallback text từ tên nếu không có
    const getInitials = (text) => {
        if (!text) return "?";
        return text
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const displayText = fallbackText ? getInitials(fallbackText) : "?";

    return (
        <View className={`relative ${className}`}>
            {/* Avatar container */}
            <View className={`
        ${sizeClasses[size]} 
        ${borderColor}
        border-2 
        rounded-full 
        overflow-hidden 
        bg-gray-100 
        items-center 
        justify-center
      `}>
                {source && !imageError ? (
                    <Image
                        source={{ uri: source }}
                        className="w-full h-full"
                        onError={() => setImageError(true)}
                        resizeMode="cover"
                    />
                ) : (
                    <Text className={`
            ${textSizeClasses[size]} 
            font-medium 
            text-gray-600
          `}>
                        {displayText}
                    </Text>
                )}
            </View>

            {/* Online status indicator */}
            {showOnlineStatus && (
                <View className={`
          absolute 
          -bottom-0.5 
          -right-0.5 
          ${onlineIndicatorSizes[size]}
          rounded-full 
          border-2 
          border-white
          ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
        `} />
            )}
        </View>
    );
}

export default Avatar;

// Ví dụ sử dụng:
/*
// Avatar với ảnh
<Avatar 
  source={{ uri: 'https://example.com/avatar.jpg' }}
  size="lg"
  fallbackText="John Doe"
  showOnlineStatus={true}
  isOnline={true}
/>

// Avatar với fallback text
<Avatar 
  fallbackText="Jane Smith"
  size="md"
  borderColor="border-blue-300"
/>

// Avatar đơn giản
<Avatar size="sm" />
*/