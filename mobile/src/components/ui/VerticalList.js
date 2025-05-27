import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import BoardingHouseCard from '@/components/ui/BoardingHouseCard';
import { AntDesign } from '@expo/vector-icons';
import { useThemedClasses } from '@/utils/useTheme';

const ITEMS_PER_PAGE = 8;

const VerticalList = ({ data, isDarkMode = false }) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const paginatedData = data.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );
  const { themedClasses } = useThemedClasses();

  // Style cho nút phân trang theo dark/light mode
  const getButtonStyle = (disabled) => ({
    backgroundColor: disabled ? '#6b7280' : isDarkMode ? '#374151' : '#fff',
    borderWidth: 1,
    borderColor: isDarkMode ? '#4B5563' : '#d9d9d9',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: disabled ? 0.5 : 1,
  });

  const getIconColor = (disabled) =>
    disabled ? '#9ca3af' : isDarkMode ? '#fff' : '#000';

  const textColor = isDarkMode ? '#fff' : '#000';

  return (
    <View style={styles.container}>
      <FlatList
        data={paginatedData}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <BoardingHouseCard {...item} />}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <View style={styles.paginationContainer}>
            {/* Nút Prev */}
            <TouchableOpacity
              onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              style={getButtonStyle(currentPage === 0)}
            >
              <AntDesign
                name="left"
                size={20}
                color={getIconColor(currentPage === 0)}
              />
            </TouchableOpacity>

            {/* Hiển thị số trang */}
            <Text
              className={themedClasses(
                'text-gray-800 text-center',
                'text-text-dark text-center'
              )}
              style={[styles.pageInfo]}
            >
              {currentPage + 1} / {totalPages}
            </Text>

            {/* Nút Next */}
            <TouchableOpacity
              onPress={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
              }
              disabled={currentPage === totalPages - 1 || totalPages === 0}
              style={getButtonStyle(
                currentPage === totalPages - 1 || totalPages === 0
              )}
            >
              <AntDesign
                name="right"
                size={20}
                color={getIconColor(
                  currentPage === totalPages - 1 || totalPages === 0
                )}
              />
            </TouchableOpacity>
          </View>
        }
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 15,
    paddingVertical: 10,
  },
  pageInfo: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerticalList;
