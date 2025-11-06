import { BackHeader } from "@/components/navigation/CustomHeader";
import { Text, Button, Loader } from "@/components/ui";
import { ScreenContainer } from "@/components/layout";
import { useThemedClasses } from "@/utils/useTheme";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import formatAmount from "@/utils/formatAmount";
import convertMonthYear from "@/utils/coverMonthYear";
import i18next from "i18next";

function PaymentDetail() {
  const { t } = useTranslation("myRentPayment");
  const { themedClasses, isDarkMode } = useThemedClasses();
  const router = useRouter();
  const currentLanguage = i18next.language;

  // Get data from router
  const { paymentData } = useLocalSearchParams();
  const [userPayment, setUserPayment] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading process
  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        setIsLoading(true);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (paymentData) {
          console.log("paymentData", JSON.parse(paymentData));
          setUserPayment(JSON.parse(paymentData));
        } else {
          setUserPayment({});
        }
      } catch (error) {
        console.error("Error parsing payment data:", error);
        setUserPayment({});
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentData();
  }, [paymentData]);

  console.log("userPayment", userPayment);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "text-green-600";
      case "pending":
        return "text-amber-600";
      case "overdue":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "#16a34a"; // green-600
      case "pending":
        return "#d97706"; // amber-600
      case "overdue":
        return "#dc2626"; // red-600
      case "canceled":
        return "#6b7280"; // gray-600
      case "failed":
        return "#dc2626"; // red-600
      default:
        return "#2563eb"; // blue-600
    }
  };

  const DetailCard = ({ icon, iconBg, label, children }) => (
    <View
      className={`mb-4 rounded-xl border ${themedClasses(
        "bg-white border-gray-100 shadow-sm",
        "bg-gray-800 border-gray-700"
      )}`}
    >
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <View
            className={`w-10 h-10 rounded-lg items-center justify-center ${iconBg}`}
          >
            {icon}
          </View>
          <Text variant="body" weight="semibold" className="ml-3 flex-1">
            {label}
          </Text>
        </View>
        <View className="ml-1">{children}</View>
      </View>
    </View>
  );

  const InfoRow = ({ label, value, isHighlight = false }) => (
    <View className="flex-row justify-between items-center py-1">
      <Text
        variant="caption"
        className={themedClasses("text-gray-600", "text-gray-400")}
      >
        {label}
      </Text>
      <Text
        variant="body"
        weight={isHighlight ? "bold" : "medium"}
        className={isHighlight ? "text-orange-500" : ""}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <ScreenContainer>
      <BackHeader
        backIcon={
          <FontAwesome5
            name="chevron-left"
            size={18}
            color={isDarkMode ? "#fff" : "#333"}
          />
        }
        onBackPress={() => router.push("/myrentpayment")}
        title={t("paymentDetail.title")}
      />

      {isLoading ? (
        <Loader />
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header Card */}
          <View className="px-4 pt-6 pb-4">
            <View
              className={`rounded-2xl border-2  p-6 ${themedClasses(
                "bg-white border-gray-100 shadow-sm",
                "bg-gray-800 border-gray-700"
              )}`}
            >
              <View className="items-center">
                <Text
                  variant="caption"
                  className={themedClasses("text-gray-600", "text-gray-400")}
                >
                  {t("paymentDetail.status")}
                </Text>
                <Text
                  variant="h3"
                  weight="bold"
                  className={`mt-1`}
                  style={{ color: getStatusTextColor(userPayment.status) }}
                >
                  {t(
                    `paymentDetail.statusLabel.${userPayment.status?.toLowerCase()}`
                  ) || userPayment.status?.toUpperCase()}
                </Text>
                <Text
                  variant="h2"
                  weight="bold"
                  className="text-orange-500 mt-3"
                >
                  {formatAmount(
                    userPayment?.paymentBillId?.paymentAmount,
                    currentLanguage
                  )}
                </Text>
                <Text
                  variant="caption"
                  className={themedClasses("text-gray-600", "text-gray-400")}
                >
                  {t("paymentDetail.totalAmount")}
                </Text>
              </View>
            </View>
          </View>

          <View className="px-4">
            {/* Property Info */}
            <DetailCard
              icon={<MaterialIcons name="home" size={20} color="#fff" />}
              iconBg="bg-blue-500"
              label={t("paymentDetail.propertyInfo")}
            >
              <InfoRow
                label={t("paymentDetail.rentalHouse")}
                value={
                  userPayment.paymentBillId?.roomId?.boardingHouseId?.name ||
                  "N/A"
                }
              />
              <InfoRow
                label={t("paymentDetail.roomNumber")}
                value={userPayment.paymentBillId?.roomId?.roomNumber || "N/A"}
              />
              <InfoRow
                label={t("paymentDetail.rentForMonth")}
                value={
                  convertMonthYear(
                    userPayment.paymentBillId?.month,
                    userPayment.paymentBillId?.year,
                    currentLanguage
                  ) || "N/A"
                }
              />
            </DetailCard>

            {/* Electricity Bill */}
            <DetailCard
              icon={<MaterialIcons name="flash-on" size={20} color="#fff" />}
              iconBg="bg-yellow-500"
              label={t("paymentDetail.electricityBill")}
            >
              <InfoRow
                label={t("paymentDetail.oldReading")}
                value={`${
                  userPayment.paymentBillId?.electricalBill?.oldNumber || 0
                } kWh`}
              />
              <InfoRow
                label={t("paymentDetail.newReading")}
                value={`${
                  userPayment.paymentBillId?.electricalBill?.newNumber || 0
                } kWh`}
              />
              <InfoRow
                label={t("paymentDetail.consumption")}
                value={`${
                  userPayment.paymentBillId?.electricalBill?.quantityConsumed ||
                  0
                } kWh`}
              />
              <View className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                <InfoRow
                  label={t("paymentDetail.electricityAmount")}
                  value={formatAmount(
                    userPayment.paymentBillId?.electricalBill?.totalAmount,
                    currentLanguage
                  )}
                  isHighlight={true}
                />
              </View>
            </DetailCard>

            {/* Water Bill */}
            <DetailCard
              icon={<MaterialIcons name="water-drop" size={20} color="#fff" />}
              iconBg="bg-blue-400"
              label={t("paymentDetail.waterBill")}
            >
              <InfoRow
                label={t("paymentDetail.oldReading")}
                value={`${
                  userPayment.paymentBillId?.waterBill?.oldNumber || 0
                } m³`}
              />
              <InfoRow
                label={t("paymentDetail.newReading")}
                value={`${
                  userPayment.paymentBillId?.waterBill?.newNumber || 0
                } m³`}
              />
              <InfoRow
                label={t("paymentDetail.consumption")}
                value={`${
                  userPayment.paymentBillId?.waterBill?.quantityConsumed || 0
                } m³`}
              />
              <View className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                <InfoRow
                  label={t("paymentDetail.waterAmount")}
                  value={formatAmount(
                    userPayment.paymentBillId?.waterBill?.totalAmount,
                    currentLanguage
                  )}
                  isHighlight={true}
                />
              </View>
            </DetailCard>

            {/* Payment Summary */}
            <DetailCard
              icon={<MaterialIcons name="receipt" size={20} color="#fff" />}
              iconBg="bg-green-500"
              label={t("paymentDetail.paymentSummary")}
            >
              <InfoRow
                label={t("paymentDetail.roomRent")}
                value={formatAmount(
                  (userPayment.paymentBillId?.paymentAmount || 0) -
                    (userPayment.paymentBillId?.electricalBill?.totalAmount ||
                      0) -
                    (userPayment.paymentBillId?.waterBill?.totalAmount || 0),
                  currentLanguage
                )}
              />
              <InfoRow
                label={t("paymentDetail.electricityAmount")}
                value={formatAmount(
                  userPayment.paymentBillId?.electricalBill?.totalAmount,
                  currentLanguage
                )}
              />
              <InfoRow
                label={t("paymentDetail.waterAmount")}
                value={formatAmount(
                  userPayment.paymentBillId?.waterBill?.totalAmount,
                  currentLanguage
                )}
              />
              <View className="border-t-2 border-orange-200  mt-3 pt-3">
                <InfoRow
                  label={t("paymentDetail.totalAmountDue")}
                  value={formatAmount(
                    userPayment?.paymentAmount,
                    currentLanguage
                  )}
                  isHighlight={true}
                />
              </View>
            </DetailCard>

            {/* Action Buttons */}
            {userPayment.status === "pending" && (
              <View className="mt-2 mb-8">
                <Button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl h-12"
                  onPress={() => {
                    router.push({
                      pathname: "/myrentpayment/payRent",
                      params: { paymentBillId: userPayment.paymentBillId._id },
                    });
                  }}
                >
                  <View className="flex-row items-center">
                    <MaterialIcons name="payment" size={20} color="#fff" />
                    <Text
                      className="text-white ml-2"
                      variant="body"
                      weight="semibold"
                    >
                      {t("paymentDetail.payNow")}
                    </Text>
                  </View>
                </Button>
              </View>
            )}

            <View className="pb-8" />
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

export default PaymentDetail;
