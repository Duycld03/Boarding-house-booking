import React, { useState } from 'react';
import { View, Text } from 'react-native';
import ListCard from '@/components/ui/ListCard';
import { BackHeader } from '@/components/navigation/CustomHeader';

const mockData = [
  {
    _id: '1',
    name: 'A',
    rating: 4,
    images: [],
    address: {},
    boardingHouseType: 'apartment',
  },
  {
    _id: '2',
    name: 'B',
    rating: 3,
    images: [],
    address: {},
    boardingHouseType: 'apartment',
  },
  {
    _id: '3',
    name: 'C',
    rating: 5,
    images: [],
    address: {},
    boardingHouseType: 'homestay',
  },
  {
    _id: '4',
    name: 'D',
    rating: 2,
    images: [],
    address: {},
    boardingHouseType: 'homestay',
  },
  {
    _id: '5',
    name: 'E',
    rating: 3,
    images: [],
    address: {},
    boardingHouseType: 'apartment',
  },
  {
    _id: '6',
    name: 'F',
    rating: 4,
    images: [],
    address: {},
    boardingHouseType: 'homestay',
  },
  {
    _id: '7',
    name: 'F',
    rating: 4,
    images: [],
    address: {},
    boardingHouseType: 'homestay',
  },
  {
    _id: '8',
    name: 'F',
    rating: 4,
    images: [],
    address: {},
    boardingHouseType: 'homestay',
  },
  {
    _id: '9',
    name: 'F',
    rating: 4,
    images: [],
    address: {},
    boardingHouseType: 'homestay',
  },
  {
    _id: '10',
    name: 'F',
    rating: 4,
    images: [],
    address: {},
    boardingHouseType: 'homestay',
  },
];

function WatchLater() {
  const [selectedId, setSelectedId] = useState(null);

  const handleConfirmDelete = () => {
    console.log('Deleting item with id:', selectedId);
  };

  return (
    <View style={{ flex: 1, paddingTop: 16 }}>
      <BackHeader title="Watch later" />
      <ListCard
        data={mockData}
        onConfirmDelete={handleConfirmDelete}
        setSelectedId={setSelectedId}
        mode="favorite"
      />
    </View>
  );
}

export default WatchLater;
