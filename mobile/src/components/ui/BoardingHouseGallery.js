import React, { useCallback, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";
import Swiper from "react-native-swiper";
import Font from "@/constants/styles/fonts";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ConfirmModal } from "../feedback";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "@/context/userContext";

const BoardingHouseGallery = ({ boardingHouseId, images }) => {
  const { t } = useTranslation("boardingHouseGallery");

  const [activeIndex, setActiveIndex] = useState(0);
  const [loginWarningVisible, setLoginWarningVisible] = useState(false);
  const router = useRouter();

  const { hasRole, isLogin, user } = useCurrentUser();

  const handleToggleLoginWarning = useCallback(() => {
    setLoginWarningVisible((prev) => !prev);
  }, []);

  const handleGoToLogin = useCallback(() => {
    setLoginWarningVisible(false);
    router.push("/(auth)/login");
  }, [router]);

  const handleReport = useCallback(() => {
    if (!isLogin) {
      setLoginWarningVisible(true);
      return;
    }
    // Handle report logic here
    router.push({
      pathname: "/(screens)/BhDetail/reportBoardingHouse",
      params: {
        boardingHouseId,
      },
    });
    console.log("Report action triggered: ", boardingHouseId);
  }, [isLogin, handleToggleLoginWarning]);

  const handleWatchLater = useCallback(() => {
    if (!isLogin) {
      setLoginWarningVisible(true);
      return;
    }
    // Handle report logic here
    console.log("Watch later action triggered: ", boardingHouseId);
  }, [isLogin, handleToggleLoginWarning]);

  // Kiểm tra nếu không có images hoặc images rỗng
  if (!images || images.length === 0) {
    return (
      <View style={styles.bannerContainer}>
        <Text>Không có hình ảnh để hiển thị</Text>
      </View>
    );
  }

  const renderPagination = (index, total) => {
    return (
      <View style={styles.paginationContainer}>
        {/* Dots Pagination */}
        <View style={styles.dotsContainer}>
          {images.map((_, dotIndex) => (
            <TouchableOpacity
              key={dotIndex}
              style={[
                styles.dot,
                activeIndex === dotIndex ? styles.activeDot : null,
              ]}
              onPress={() => setActiveIndex(dotIndex)}
            />
          ))}
        </View>

        {/* Counter Pagination */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {activeIndex + 1} / {total}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.bannerContainer}>
      <Swiper
        style={styles.wrapper}
        showsButtons={false}
        autoplay={true}
        autoplayTimeout={3}
        onIndexChanged={(index) => setActiveIndex(index)}
        renderPagination={renderPagination}
      >
        {images.map((image, index) => (
          <View key={index} style={styles.slide}>
            <Image
              source={{ uri: image?.imageUrl }}
              style={styles.bannerImage}
              resizeMode="cover"
            />

            {/* Icon controls at top right corner */}
            <View style={styles.iconControlsContainer}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleWatchLater}
              >
                <MaterialIcons name="watch-later" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleReport}
              >
                <MaterialIcons name="report" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </Swiper>

      {/* Login Warning Modal */}
      <ConfirmModal
        confirmText={t("common.goToLogin", "Go to Login")}
        visible={loginWarningVisible}
        message={t(
          "auth.loginRequired",
          "You must login before creating an appointment"
        )}
        onConfirm={handleGoToLogin}
        title={t("common.warning", "Warning")}
        onClose={handleToggleLoginWarning}
        warningMode
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: "100%",
    height: 250,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  paginationContainer: {
    position: "absolute",
    bottom: -30,
    width: "100%",
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  dot: {
    backgroundColor: "#E9F0FF",
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  activeDot: {
    backgroundColor: "#40B0FF",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  counterContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  counterText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  title: {
    position: "absolute",
    bottom: 120,
    left: 10,
    fontSize: 24,
    color: "#FFF",
    fontFamily: Font.pBlack,
  },
  linkContainer: {
    flex: 1,
  },
  // New styles for the icons
  iconControlsContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});

export default BoardingHouseGallery;
