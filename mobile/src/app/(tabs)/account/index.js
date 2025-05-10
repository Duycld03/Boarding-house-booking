import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Color from '@/constants/styles/color';
import Font from '@/constants/styles/fonts';

function Account() {
  const router = useRouter();

  const logout = async () => {
    await AsyncStorage.removeItem('access_token');
    router.replace('/profile');
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}
    >
      <Text style={{ fontSize: 20, fontFamily: Font.pBold, marginBottom: 20 }}>
        Account
      </Text>

      <Pressable
        onPress={logout}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 20,
          backgroundColor: Color.blue,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: 'white', fontFamily: Font.pBold }}>Logout</Text>
      </Pressable>
    </View>
  );
}

export default Account;
