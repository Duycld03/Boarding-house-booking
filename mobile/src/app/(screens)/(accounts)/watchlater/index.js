import { BackHeader } from '@/components/navigation/CustomHeader';
import { Text, View } from 'react-native';

function WatchLater() {
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
        WatchLater
      </Text>
    </View>
  );
}

export default WatchLater;
