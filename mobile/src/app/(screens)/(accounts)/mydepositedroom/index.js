import { BackHeader } from '@/components/navigation/CustomHeader';
import { Text, View } from 'react-native';

function Mydepositedroom() {
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
        Deposited room
      </Text>
    </View>
  );
}

export default Mydepositedroom;
