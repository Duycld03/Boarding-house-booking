import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login/index"
        options={{
          headerShown: false,
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontFamily: "Poppins-Bold",
            fontSize: 20,
          },
          headerLeft: () => <FontAwesome name="arrow-left" size={24} />,
        }}
      />
      <Stack.Screen
        name="register/index"
        options={{
          headerShown: false,
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontFamily: "Poppins-Bold",
            fontSize: 20,
          },
          headerLeft: () => <FontAwesome name="arrow-left" size={24} />,
        }}
      />
      <Stack.Screen
        name="verifyRegister/index"
        options={{
          headerShown: false,
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontFamily: "Poppins-Bold",
            fontSize: 20,
          },
          headerLeft: () => <FontAwesome name="arrow-left" size={24} />,
        }}
      />
    </Stack>
  );
}
