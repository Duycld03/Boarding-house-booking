import { Stack } from 'expo-router';

const ScreenLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="(accounts)/profile/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(accounts)/myfavorite/index"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
};

export default ScreenLayout;
