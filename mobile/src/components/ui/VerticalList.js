import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import BoardingHouseCard from '@/components/ui/BoardingHouseCard';
import { useThemedClasses } from '@/utils/useTheme';

const VerticalList = ({ data, isDarkMode = false, loading }) => {
  const { themedClasses } = useThemedClasses();

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center', height: 300 },
        ]}
      >
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center', height: 300 },
        ]}
      >
        <Text>No data available</Text>
      </View>
    );
  }

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
    flex: 1,
  },
  list: {
    paddingLeft: 15,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

export default VerticalList;
