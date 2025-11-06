import { View, Text, Pressable, ScrollView, Animated, Image } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useThemedClasses } from "@/utils/useTheme";
import { useTheme } from "@/context/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import { ScreenContainer } from "@/components/layout";
import Loader from "@/components/ui/Loader";
import { useCurrentUser } from "@/context/userContext";
import Logo from '../../../assets/images/newLogo.png';


const Account = () => {
  const router = useRouter();
  const { themedClasses } = useThemedClasses();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation("account");
  const { contextLogout, isLogin } = useCurrentUser();

  const [loading, setLoading] = useState(false);

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

  // const checkUser = async () => {
  //   try {
  //     setLoading(true);
  //     await getUser();
  //     setIsLogin(true);
  //   } catch {
  //     setIsLogin(false);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useFocusEffect(
  //   useCallback(() => {
  //     checkUser();
  //   }, [])
  // );

  if (loading) {
    return <Loader />;
  }

  return (
    <ScreenContainer withPadding={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="p-5">
          {/* Header with Logo */}
          <View
            className={themedClasses(
              "mb-6 border-b border-gray-200 pb-4",
              "mb-6 border-b border-gray-700 pb-4"
            )}
          >
            <View className="flex-row items-center">
              <View
                className={themedClasses(
                  "mr-3 p-2 rounded-full bg-gray-100",
                  "mr-3 p-2 rounded-full bg-gray-800"
                )}
              >
                <Image
                  source={Logo}
                  className="w-8 h-8"
                  resizeMode="contain"
                />
              </View>
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

        {isLogin && (
          <View className="p-5 border-t border-gray-200 dark:border-gray-700">
            <Pressable
              onPress={async () => {
                contextLogout();
                router.replace("/home");
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