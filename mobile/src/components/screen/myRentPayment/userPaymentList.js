import { ScrollView, View } from "react-native";
import { Text } from '@/components/ui';
import UserPaymentCard from "./userPaymentCard";

function UserPaymentList({ payments, t, isDarkMode, themedClasses, loading = false }) {
    // Early return nếu đang loading
    if (loading) {
        return null; // Hoặc return <Loader /> nếu muốn hiển thị loading
    }

    // Early return nếu không có payments hoặc payments rỗng
    if (!payments || payments.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{
                    color: isDarkMode ? '#ccc' : '#666',
                    textAlign: 'center',
                    fontSize: 16
                }}>
                    {t('noPayments')}
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                paddingBottom: 20
            }}
            showsVerticalScrollIndicator={false}
        >
            {payments.map((payment, index) => (
                <UserPaymentCard
                    key={payment.id || `payment-${index}`} // Sử dụng unique ID thay vì index
                    payment={payment}
                    t={t}
                    isDarkMode={isDarkMode}
                    themedClasses={themedClasses}
                />
            ))}
        </ScrollView>
    );
}

export default UserPaymentList;