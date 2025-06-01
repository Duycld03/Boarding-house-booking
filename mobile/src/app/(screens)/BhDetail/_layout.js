import { Stack } from "expo-router";


export default function BhDetailLayout() {
    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,

                }}
            >
                <Stack.Screen name="[id]"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen name="createAppointment"
                    options={{
                        headerShown: false,
                    }}
                />

            </Stack>
        </>
    );
}