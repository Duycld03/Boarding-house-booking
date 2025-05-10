import { BackHeader } from '@/components/navigation/CustomHeader';
import { Text, View } from 'react-native';

function Setting() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F5FCFF',
        }}
      >
        Setting
      </Text>
    </View>
  );
}

export default Setting;
