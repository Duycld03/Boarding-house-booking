import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Slider from '@react-native-community/slider';
import { Checkbox, Button, RadioButton } from "react-native-paper";
import { getAllBoardingHouseTypeUser, getMaxPriceBHUser, getBhByArea } from "@/API/boardingHouseAPI";
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BackHeader } from '@/components/navigation/CustomHeader';
import { useThemedClasses } from '@/utils/useTheme';
import ScreenContainer, {
  ScrollContainer,
} from '@/components/layout/ScreenContainer';
import { Picker } from '@react-native-picker/picker';
import { useCallback } from 'react';

const ExploreFilterScreen = () => {
  const router = useRouter();
  const [nameFilter, setNameFilter] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000000 });
  const [currentPrice, setCurrentPrice] = useState([0, 50000000]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [ratings, setRatings] = useState([]);
  const { t } = useTranslation('filter');
  const [loading, setLoading] = useState(false);
  const { themedClasses, isDarkMode } = useThemedClasses();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  const styles = getStyles(isDarkMode);

  useFocusEffect(
    useCallback(() => {
      setNameFilter("");
      setSelectedType(null);
      setRatings([]);
      setSelectedProvince('');
      setSelectedDistrict('');
      setSelectedWard('');
      setCurrentPrice([0, priceRange.max]);

      fetchData();
      fetchAreas();

      return () => { };
    }, [])
  );

  const fetchAreas = async () => {
    try {
      const res = await getBhByArea();
      const uniqueProvinces = [...new Set(res.map(bh => bh.address?.province).filter(Boolean))];
      const uniqueDistricts = [...new Set(res.map(bh => bh.address?.district).filter(Boolean))];
      const uniqueWards = [...new Set(res.map(bh => bh.address?.ward).filter(Boolean))];
      setProvinces(uniqueProvinces);
      setDistricts(uniqueDistricts);
      setWards(uniqueWards);
    } catch (err) {
      console.error("Failed to fetch areas:", err);
    }
  };
  const fetchData = async () => {
    try {
      const priceRes = await getMaxPriceBHUser();
      if (priceRes?.maxPrice) {
        setPriceRange({ min: 0, max: priceRes.maxPrice });
        setCurrentPrice([0, priceRes.maxPrice]);
      }

      const typeRes = await getAllBoardingHouseTypeUser();
      if (typeRes?.data) {
        setTypes(typeRes.data);
      }
    } catch (e) {
      console.error("Fetch filter options failed:", e);
    }
  };

  const toggleRating = (value: number) => {
    setRatings((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    );
  };

  const handleApplyFilter = async () => {
    const filters = {
      name: nameFilter || null,
      priceRange: `${currentPrice[0]},${currentPrice[1]}`,
      boardingHouseType: selectedType || null,
      rating: ratings.length > 0 ? ratings.join(",") : null,
    };

    router.push({
      pathname: "/(screens)/filterBH",
      params: {
        name: nameFilter || "",
        priceRange: `${currentPrice[0]},${currentPrice[1]}`,
        boardingHouseType: selectedType || "",
        rating: ratings.join(","),
        province: selectedProvince,
        district: selectedDistrict,
        ward: selectedWard,
      },
    });

  };

  return (
    <ScreenContainer withPadding={false} className={isDarkMode ? 'bg-black' : 'bg-white'}>
      <BackHeader title={t('filterTitle')} />
      <ScrollContainer
        contentContainerStyle={{ padding: 16 }}
      >
        <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
          {t("name")}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
              color: isDarkMode ? "#fff" : "#000",
              borderColor: isDarkMode ? "#4b5563" : "#ccc",
            },
          ]}
          placeholder={t("enterName")}
          placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
          value={nameFilter}
          onChangeText={setNameFilter}
        />

        <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
          {t("priceRange")}
        </Text>
        <Text style={{ color: isDarkMode ? "#d1d5db" : "#374151", marginBottom: 4 }}>
          {`${t("min")}: ${currentPrice[0]} - ${t("max")}: ${currentPrice[1]}`}
        </Text>
        <Slider
          minimumValue={priceRange.min}
          maximumValue={priceRange.max}
          step={100000}
          value={currentPrice[1]}
          onValueChange={(value) => setCurrentPrice([currentPrice[0], value])}
          minimumTrackTintColor={isDarkMode ? "#60a5fa" : "#2563eb"}
          maximumTrackTintColor={isDarkMode ? "#374151" : "#d1d5db"}
          thumbTintColor={isDarkMode ? "#60a5fa" : "#2563eb"}
        />

        <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
          {t("type")}
        </Text>
        {types.map((type: any) => (
          <TouchableOpacity
            key={type.value}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
            onPress={() => setSelectedType(type.value)}
          >
            <RadioButton
              value={type.value}
              status={selectedType === type.value ? "checked" : "unchecked"}
              onPress={() => setSelectedType(type.value)}
              color={isDarkMode ? "#60a5fa" : "#2563eb"}
            />
            <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>{type.label}</Text>
          </TouchableOpacity>
        ))}

        <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
          {t("rating")}
        </Text>
        {[1, 2, 3, 4, 5].map((r) => (
          <TouchableOpacity
            key={r}
            style={styles.option}
            onPress={() => toggleRating(r)}
          >
            <Checkbox
              status={ratings.includes(r) ? "checked" : "unchecked"}
              color={isDarkMode ? "#60a5fa" : "#2563eb"}
            />
            <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>
              {"⭐".repeat(r)}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>
          {t("province")}
        </Text>
        <Picker
          selectedValue={selectedProvince}
          onValueChange={(value) => setSelectedProvince(value)}
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
              color: isDarkMode ? '#fff' : '#000',
            },
          ]}
          dropdownIconColor={isDarkMode ? '#fff' : '#000'}
        >
          <Picker.Item label={t("selectProvince")} value="" />
          {provinces.map((p, index) => (
            <Picker.Item key={index} label={p} value={p} />
          ))}
        </Picker>

        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>
          {t("district")}
        </Text>
        <Picker
          selectedValue={selectedDistrict}
          onValueChange={(value) => setSelectedDistrict(value)}
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
              color: isDarkMode ? '#fff' : '#000',
            },
          ]}
          dropdownIconColor={isDarkMode ? '#fff' : '#000'}
        >
          <Picker.Item label={t("selectDistrict")} value="" />
          {districts.map((d, index) => (
            <Picker.Item key={index} label={d} value={d} />
          ))}
        </Picker>

        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>
          {t("ward")}
        </Text>
        <Picker
          selectedValue={selectedWard}
          onValueChange={(value) => setSelectedWard(value)}
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
              color: isDarkMode ? '#fff' : '#000',
            },
          ]}
          dropdownIconColor={isDarkMode ? '#fff' : '#000'}
        >
          <Picker.Item label={t("selectWard")} value="" />
          {wards.map((w, index) => (
            <Picker.Item key={index} label={w} value={w} />
          ))}
        </Picker>

        <Button
          mode="contained"
          onPress={handleApplyFilter}
          loading={loading}
          style={{
            marginTop: 24,
            backgroundColor: isDarkMode ? "#60a5fa" : "#2563eb",
          }}
        >
          {t('applyFilter')}
        </Button>
      </ScrollContainer>

    </ScreenContainer>
  );
}

export default ExploreFilterScreen;

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: isDark ? '#121212' : '#fff',
    },
    label: {
      fontSize: 16,
      marginTop: 16,
      color: isDark ? '#fff' : '#000',
    },
    text: {
      color: isDark ? '#ccc' : '#333',
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? '#555' : '#ccc',
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
      color: isDark ? '#fff' : '#000',
      padding: 8,
      borderRadius: 8,
      marginTop: 4,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 4,
    },
    button: {
      marginTop: 24,
      backgroundColor: isDark ? '#90caf9' : '#2196f3',
    },
    buttonText: {
      color: '#fff',
    },
  });