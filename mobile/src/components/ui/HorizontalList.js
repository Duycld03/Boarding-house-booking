import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import BoardingHouseCard from '@/components/ui/BoardingHouseCard';

const HorizontalList = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center', height: 150 },
        ]}
      >
        <Text>No data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <BoardingHouseCard {...item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 5,
  },
});

export default HorizontalList;
