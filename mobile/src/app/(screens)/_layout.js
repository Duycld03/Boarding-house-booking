import { Stack } from 'expo-router';

const ScreenLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="(accounts)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="BhDetail"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
};

export default ScreenLayout;
