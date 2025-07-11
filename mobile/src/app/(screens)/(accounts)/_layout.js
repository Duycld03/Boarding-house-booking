import { Stack } from "expo-router";

const AccountLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="myfavorite/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="myappointment/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="watchlater/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="myreportmanagement/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="myreportmanagement/detailReport"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="mydepositedroom/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="myrentpayment/payRent"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="mydepositedroom/payDeposit"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="myrenewalrequest/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="myrentpayment/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="mydepositrefundrequest/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="setting/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="myrentpayment/paymentDetail"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
};

export default AccountLayout;
