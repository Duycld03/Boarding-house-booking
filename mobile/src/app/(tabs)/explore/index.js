import { BackHeader } from "@/components/navigation/CustomHeader";
import { Text, View } from "react-native";

function Explore() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Explore</Text>
      <BackHeader title="Home" />

    </View>
  );
}

export default Explore;
