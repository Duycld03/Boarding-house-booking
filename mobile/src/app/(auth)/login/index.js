import { Text, View } from "react-native";

function Login() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5FCFF",
      }}
    >
      <Text style={{ fontSize: 20, textAlign: "center", margin: 10 }}>
        Welcome to the Login Screen!
      </Text>
    </View>
  );
}

export default Login;
