import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useThemedClasses } from "@/utils/useTheme";
import { useTheme } from "@/context/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScreenContainer, ScrollContainer } from "@/components/layout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUser } from "@/API/authManagement";

const Account = () => {
  const router = useRouter();
  const { themedClasses } = useThemedClasses();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation("account");

  const [isLogin, setIsLogin] = useState(false);

  const animatedValues = useRef(
    Array(10)
      .fill(0)
      .map(() => new Animated.Value(1))
  ).current;

  const accountOptions = [
    {
      label: t("profile"),
      icon: "user",
      path: "/profile",
      color: isDarkMode ? "#60a5fa" : "#3b82f6",
    },
    {
      label: t("my_appointment"),
      icon: "calendar",
      path: "/myappointment",
      color: "#EA4335",
    },
    {
      label: t("my_favorite"),
      icon: "heart",
      path: "/myfavorite",
      color: "#FBBC05",
    },
    {
      label: t("watch_later"),
      icon: "clock-o",
      path: "/watchlater",
      color: "#34A853",
    },
    {
      label: t("my_report_management"),
      icon: "file-text",
      path: "/myreportmanagement",
      color: "#7E57C2",
    },
    {
      label: t("my_deposited_room"),
      icon: "home",
      path: "/mydepositedroom",
      color: "#FF7043",
    },
    {
      label: t("my_renewal_request"),
      icon: "repeat",
      path: "/myrenewalrequest",
      color: "#26A69A",
    },
    {
      label: t("my_rent_payment"),
      icon: "dollar",
      path: "/myrentpayment",
      color: "#42A5F5",
    },
    {
      label: t("my_deposit_refund_request"),
      icon: "undo",
      path: "/mydepositrefundrequest",
      color: "#EC407A",
    },
    {
      label: t("setting"),
      icon: "cog",
      path: "/setting",
      color: "#78909C",
    },
  ];

  const handleNavigate = (path, index) => {
    Animated.sequence([
      Animated.timing(animatedValues[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push(path);
    });
  };

  useFocusEffect(
    useCallback(() => {
      checkUser();
    }, [])
  );

  const checkUser = async () => {
    try {
      await getUser();
      setIsLogin(true);
    } catch (err) {
      setIsLogin(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="p-5">
          <View
            className={themedClasses(
              "mb-6 border-b border-gray-200 pb-3",
              "mb-6 border-b border-gray-700 pb-3"
            )}
          >
            <Text
              className={themedClasses(
                "text-2xl text-text-light",
                "text-2xl text-text-dark"
              )}
              style={{ fontFamily: "Poppins-Bold" }}
            >
              {t("account")}
            </Text>
          </View>

          <View className="gap-3">
            {accountOptions.map((item, index) => (
              <Animated.View
                key={index}
                style={{
                  transform: [{ scale: animatedValues[index] }],
                }}
              >
                <Pressable
                  onPress={() => handleNavigate(item.path, index)}
                  className={themedClasses(
                    "flex-row items-center p-4 rounded-xl bg-card-light border border-gray-100 shadow-sm",
                    "flex-row items-center p-4 rounded-xl bg-card-dark border border-gray-700"
                  )}
                  android_ripple={{
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.05)",
                      borderRadius: 12,
                      padding: 10,
                    }}
                  >
                    <FontAwesome
                      name={item.icon}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text
                      className={themedClasses(
                        "text-base text-text-light",
                        "text-base text-text-dark"
                      )}
                      style={{ fontFamily: "Poppins-SemiBold" }}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <FontAwesome
                    name="chevron-right"
                    size={16}
                    color={isDarkMode ? "#9ca3af" : "#6b7280"}
                  />
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>

        <View className="h-8" />
        {/* Logout button */}
        {isLogin && (
          <View className="p-5 border-t border-gray-200 dark:border-gray-700">
            <Pressable
              onPress={async () => {
                AsyncStorage.removeItem("access_token", () => {
                  router.replace("/home");
                });
              }}
              className={themedClasses(
                "flex-row items-center justify-center p-4 rounded-xl bg-red-500",
                "flex-row items-center justify-center p-4 rounded-xl bg-red-600"
              )}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <FontAwesome name="sign-out" size={20} color="white" />
              <Text
                className="ml-2 text-white text-base"
                style={{ fontFamily: "Poppins-SemiBold" }}
              >
                {t("logout")}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

export default Account;
