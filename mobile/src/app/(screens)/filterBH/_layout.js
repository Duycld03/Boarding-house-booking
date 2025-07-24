import { Stack } from 'expo-router';

export default function FilteredResultScreen() {
    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="index" />
            </Stack>
        </>
    );
}