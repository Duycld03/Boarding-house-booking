import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/layout';
import { Text } from '@/components/ui';

const ExtraPrices = ({ boardingHouse, t, formatAmount }) => {
    return (
        <ScreenContainer
            withPadding={false}
            className="pt-0"
        >
            <Text
                variant="subtitle"
                weight="bold"
            >{t("extraPrice")}</Text>

            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t("electricityPrice")}:</Text>
                <Text style={styles.priceValue}>
                    {formatAmount(boardingHouse?.electricityPrice)} {t("kWh")} (VND)
                </Text>
            </View>

            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t("waterPrice")}:</Text>
                <Text style={styles.priceValue}>
                    {formatAmount(boardingHouse?.waterPrice)} m3 (VND)
                </Text>
            </View>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    priceLabel: {
        fontSize: 14,
        flex: 1,
    },
    priceValue: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
    },
});

export default ExtraPrices;