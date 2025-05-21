import { Stack } from "expo-router";

const ProfileLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="ChangePassword" options={{ headerShown: false }} />
      <Stack.Screen name="ChangeEmail" options={{ headerShown: false }} />
      <Stack.Screen name="verifyChangeEmail" options={{ headerShown: false }} />
    </Stack>
  );
};

export default ProfileLayout;
