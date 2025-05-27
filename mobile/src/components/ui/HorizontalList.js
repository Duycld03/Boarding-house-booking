import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import BoardingHouseCard from '@/components/ui/BoardingHouseCard';

const HorizontalList = ({ data }) => {
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    marginBottom: 8,
  },
  list: {
    paddingLeft: 12,
  },
});

export default HorizontalList;
