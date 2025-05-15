import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeProvider";
import { useThemedClasses } from "@/utils/useTheme";
import { useNotification } from "@/context/NotificationProvider";
import Button from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { BackHeader } from "@/components/navigation/CustomHeader";

function Home() {
  const { toggleTheme, isDarkMode } = useTheme();
  const { themedClasses } = useThemedClasses();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const router = useRouter();

  const handleShowNotification = () => {
    showInfo("This is a info notification");
  };

  const handleRegister = () => {
    router.push("/register");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className={themedClasses(
        "flex-1 items-center justify-center bg-background-light px-6",
        "flex-1 items-center justify-center bg-background-dark px-6"
      )}
    >
      <Text
        className={themedClasses(
          "text-3xl font-extrabold text-red-500 mb-8 text-center",
          "text-3xl font-extrabold text-text-dark mb-8 text-center"
        )}
      >
        Welcome to My App
      </Text>
      <Button
        variant="primary"
        onPress={() => router.push("/(screens)/profile/ChangePassword")}
      >
        ChangePassword
      </Button>

      <TouchableOpacity
        onPress={toggleTheme}
        activeOpacity={0.8}
        className={themedClasses(
          "w-full max-w-xs py-4 rounded-xl bg-primary-light mb-4 shadow-lg",
          "w-full max-w-xs py-4 rounded-xl bg-primary-dark mb-4 shadow-lg"
        )}
      >
        <Text className="text-white text-lg font-semibold text-center">
          Switch to {isDarkMode ? "Light" : "Dark"} Mode
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleShowNotification}
        className={themedClasses(
          "w-full max-w-xs py-4 rounded-xl bg-primary-light mb-4 shadow-lg",
          "w-full max-w-xs py-4 rounded-xl bg-primary-dark mb-4 shadow-lg"
        )}
      >
        <Text
          className={themedClasses(
            "text-white text-lg font-semibold text-center",
            "text-white text-lg font-semibold text-center"
          )}
        >
          show notification
        </Text>
      </TouchableOpacity>

      <Text
        className={themedClasses(
          "text-base text-gray-500 mt-8 text-center",
          "text-base text-gray-400 mt-8 text-center"
        )}
      >
        Tap the button above to toggle between Light and Dark mode.
      </Text>
      <Button variant="primary" onPress={handleRegister}>
        Register
      </Button>
      <Button variant="primary" onPress={handleLogin}>
        Login
      </Button>
    </SafeAreaView>
  );
}

export default Home;
