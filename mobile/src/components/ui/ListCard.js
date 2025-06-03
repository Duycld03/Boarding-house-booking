import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const getPrimaryImage = (images = [], fallbackImages = []) => {
  const source =
    Array.isArray(images) && images.length > 0 ? images : fallbackImages;
  if (!Array.isArray(source) || source.length === 0) {
    return 'https://via.placeholder.com/200';
  }
  const primary = source.find((img) => img?.isPrimary);
  return primary ? primary.imageUrl : source[0].imageUrl;
};

const getAddress = (address, t) => {
  if (!address) {
    return t('addressFormat', {
      detail: 'N/A',
      ward: '',
      district: '',
      province: '',
    });
  }
  const { detail, ward, district, province } = address;
  return t('addressFormat', { detail, ward, district, province });
};

const renderStars = (rating = 0) => {
  const stars = Math.round(rating);
  return (
    <View style={styles.rating}>
      {Array.from({ length: stars }).map((_, i) => (
        <AntDesign key={i} name="star" size={16} color="#facc15" />
      ))}
    </View>
  );
};

const ListCard = ({
  data,
  onConfirmDelete,
  setSelectedId,
  mode = 'watchLater',
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  const navigation = useNavigation();
  const { t } = useTranslation('common');
  const router = useRouter();

  const handleRemove = (id) => {
    setSelectedId(id);
    onConfirmDelete();
  };

  const goToDetail = (id) => {
    router.push(`/BhDetail/${id}`);
  };

  const renderItem = ({ item }) => {
    const house = item?.boardingHouseId || item;
    const navigateId = house?._id;
    const itemId = mode === 'favorite' ? house?._id : item?._id || item?.id;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => goToDetail(navigateId)}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: getPrimaryImage(house?.images, house?.img) }}
            style={styles.image}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{house?.name}</Text>
          <Text style={styles.type}>
            {t(
              `boardingHouseTypes.${
                typeof house?.boardingHouseType === 'object'
                  ? house?.boardingHouseType?.name
                  : house?.boardingHouseType || 'Unknown'
              }`
            )}
          </Text>
          {renderStars(house?.rating)}
          <Text style={styles.address}>{getAddress(house?.address, t)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleRemove(itemId)}
          style={styles.deleteIcon}
        >
          <AntDesign name="close" size={20} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item?._id || index}`}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.paginationContainerRight}>
            <TouchableOpacity
              onPress={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              style={[
                styles.paginationButton,
                currentPage === 1 && styles.disabledButton,
              ]}
            >
              <AntDesign
                name="left"
                size={20}
                color={currentPage === 1 ? '#9ca3af' : '#000'}
              />
            </TouchableOpacity>

            <Text style={styles.pageText}>
              {currentPage} / {totalPages}
            </Text>

            <TouchableOpacity
              onPress={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={[
                styles.paginationButton,
                currentPage === totalPages && styles.disabledButton,
              ]}
            >
              <AntDesign
                name="right"
                size={20}
                color={currentPage === totalPages ? '#9ca3af' : '#000'}
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
    padding: 12,
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    alignItems: 'center',
  },
  imageWrapper: {
    width: 100,
    height: 100,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  type: {
    fontSize: 14,
    color: '#666',
  },
  rating: {
    flexDirection: 'row',
    marginTop: 4,
  },
  address: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  deleteIcon: {
    marginLeft: 8,
  },
  paginationContainerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 12,
  },
  paginationButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  pageText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ListCard;
