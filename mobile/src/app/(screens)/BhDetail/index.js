import { ScreenContainer, ScrollContainer } from '@/components/layout'
import { Text, BoardingHouseGallery } from '@/components/ui';
import {
    getBoardingHouseDetail,
    getReviewByBhId,
    getRoomTypeByBhId,
} from "@/API/ownerUser/boardingHouse";
import { useRouter } from 'expo-router';
import { use, useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeProvider';
import { useTranslation } from 'react-i18next';

export default function BhDetailScreen() {

    const { t } = useTranslation("b");
    const { isDarkMode } = useTheme();


    const router = useRouter();
    // const { id } = router.query;
    const id = "64ab1cd234abcd1234567878"

    const [boardingHouseDetail, setBoardingHouseDetail] = useState(null);
    const [roomType, setRoomType] = useState(null);
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBoardingHouse = async () => {
        try {
            const response = await getBoardingHouseDetail(id);
            setBoardingHouseDetail(response);
        } catch (error) {
            console.error("Error fetching boarding house details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setRefreshing(true);
            await fetchBoardingHouse();
            setRefreshing(false);
        };

        fetchData();
    }, [])



    return (
        <ScreenContainer
            withPadding={false}
        >
            <ScrollContainer>
                <Text
                >This is bh detail</Text>
            </ScrollContainer>
        </ScreenContainer>);
}

