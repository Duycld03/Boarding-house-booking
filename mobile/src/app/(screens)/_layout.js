import { Stack } from 'expo-router';

const ScreenLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="(accounts)"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="BhDetail"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="allBH"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="newestBH"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="highRatingBH"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
};

export default ScreenLayout;
