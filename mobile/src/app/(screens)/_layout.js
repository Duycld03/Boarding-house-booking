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
        <Stack.Screen
          name="(accounts)/myappointment/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(accounts)/watchlater/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(accounts)/myreportmanagement/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(accounts)/mydepositedroom/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(accounts)/myrenewalrequest/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(accounts)/myrentpayment/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(accounts)/mydepositrefundrequest/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(accounts)/setting/index"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
};

export default ScreenLayout;
