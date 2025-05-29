import { BackHeader } from "@/components/navigation/CustomHeader";
import { Pressable, Text, View } from "react-native";
import { useRouter, Link } from "expo-router";

function Explore() {

  const router = useRouter();
  const handleBack = () => {
    router.back();
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Explore</Text>
      <Link
        href={"/(tabs)/home"}
        style={{ padding: 10, backgroundColor: "#007BFF", borderRadius: 5 }}
      // onPress={handleBack}
      >
        <Text>Go back to home</Text>
      </Link>
    </View>
  );
}

export default Explore;
