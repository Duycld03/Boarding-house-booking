import { Stack } from 'expo-router';

export default function highRatingBHLayout() {
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
