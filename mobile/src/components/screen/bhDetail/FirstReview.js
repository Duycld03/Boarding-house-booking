import { View } from "react-native";
import { Text } from '@/components/ui'
import { useTheme } from '@/context/ThemeProvider'
import ReviewCard from "./ReviewCard";


function FirstReview({ t, ReviewData }) {

    const { isDarkMode } = useTheme();


    return (
        // Render one Review
        <View>
            <View>

            </View>
        </View>
    );
}

export default FirstReview;