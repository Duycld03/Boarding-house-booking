import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import BoardingHouseCard from '@/components/ui/BoardingHouseCard';

const VerticalList = ({ data }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <BoardingHouseCard {...item} />}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
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
    paddingBottom: 80,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

export default VerticalList;
