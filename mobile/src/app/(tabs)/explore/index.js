import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image
} from "react-native";
import Slider from '@react-native-community/slider';
import { Checkbox, RadioButton } from "react-native-paper";
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
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { fetchProvinces, fetchDistricts, fetchWards } from "@/API/apiAddress";
import { Button } from "@/components/ui";
import Logo from '../../../assets/images/newLogo.png';

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
  const selectedProvinceName = provinces.find(p => p.code === selectedProvince)?.name || '';
  const selectedDistrictName = districts.find(d => d.code === selectedDistrict)?.name || '';
  const selectedWardName = wards.find(w => w.code === selectedWard)?.name || '';
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

  // const fetchAreas = async () => {
  //   try {
  //     const res = await getBhByArea();
  //     const uniqueProvinces = [...new Set(res.map(bh => bh.address?.province).filter(Boolean))];
  //     const uniqueDistricts = [...new Set(res.map(bh => bh.address?.district).filter(Boolean))];
  //     const uniqueWards = [...new Set(res.map(bh => bh.address?.ward).filter(Boolean))];
  //     setProvinces(uniqueProvinces);
  //     setDistricts(uniqueDistricts);
  //     setWards(uniqueWards);
  //   } catch (err) {
  //     console.error("Failed to fetch areas:", err);
  //   }
  // };
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
        priceRange: `${currentPrice[0]},${currentPrice[1]}`,
        boardingHouseType: selectedType || "",
        rating: ratings.join(","),
        province: selectedProvinceName,
        district: selectedDistrictName,
        ward: selectedWardName,
      },
    });

  };
  const fetchAreas = async () => {
    try {
      const provincesData = await fetchProvinces();
      setProvinces(provincesData);
    } catch (err) {
      console.error("Failed to fetch provinces:", err);
    }
  };

  const handleProvinceChange = async (provinceCode) => {
    setSelectedProvince(provinceCode);
    setSelectedDistrict('');
    setSelectedWard('');
    try {
      const districtsData = await fetchDistricts(provinceCode);
      setDistricts(districtsData);
      setWards([]); // reset wards
    } catch (err) {
      console.error("Failed to fetch districts:", err);
    }
  };

  const handleDistrictChange = async (districtCode) => {
    setSelectedDistrict(districtCode);
    setSelectedWard('');
    try {
      const wardsData = await fetchWards(districtCode);
      setWards(wardsData);
    } catch (err) {
      console.error("Failed to fetch wards:", err);
    }
  };
  const pickerStyle = [
    styles.input,
    {
      backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
      height: 55
    },
  ];

  return (
    <ScreenContainer withPadding={false} className={isDarkMode ? 'bg-black' : 'bg-white'}>
      {/* <BackHeader title={t('filterTitle')} /> */}
      <ScrollContainer contentContainerStyle={{ paddingHorizontal: 10 }}>
        <View
          className={themedClasses(
            "mb-6 border-b border-gray-200 pb-4",
            "mb-6 border-b border-gray-700 pb-4"
          )}
        >
          <View className="flex-row items-center">
            <View
              className={themedClasses(
                "mr-3 p-2 rounded-full bg-gray-100",
                "mr-3 p-2 rounded-full bg-gray-800"
              )}
            >
              <Image
                source={Logo}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </View>
            <Text
              className={themedClasses(
                "text-2xl text-text-light",
                "text-2xl text-text-dark"
              )}
              style={{ fontFamily: "Poppins-Bold" }}
            >
              {t("filterTitle")}
            </Text>
          </View>
        </View>
        {/* <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
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
        /> */}

        <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16, fontWeight: '600' }}>
          {t("priceRange")}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
          <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>
            {t("min")}: {currentPrice[0].toLocaleString()}
          </Text>
          <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>
            {t("max")}: {currentPrice[1].toLocaleString()}
          </Text>
        </View>
        <View style={{ paddingHorizontal: 56, marginTop: 8 }}>
          <MultiSlider
            values={currentPrice}
            min={priceRange.min}
            max={priceRange.max}
            step={100000}
            onValuesChange={(values) => setCurrentPrice(values)}
            selectedStyle={{ backgroundColor: isDarkMode ? "#60a5fa" : "#2563eb" }}
            unselectedStyle={{ backgroundColor: isDarkMode ? "#374151" : "#d1d5db" }}
            markerStyle={{
              backgroundColor: isDarkMode ? "#60a5fa" : "#2563eb",
              height: 20,
              width: 20,
            }}
            containerStyle={{
              height: 40,
              alignSelf: 'stretch',
            }}
            trackStyle={{
              height: 6,
              borderRadius: 3,
            }}
          />
        </View>
        <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16, fontWeight: '600', marginTop: 12 }}>
          {t("type")}
        </Text>
        {types.map((type: any) => (
          <TouchableOpacity
            key={type.value}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, marginTop: 4 }}
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
          onValueChange={handleProvinceChange}
          style={pickerStyle}
          itemStyle={{ fontSize: 14 }}
        >
          <Picker.Item label={t("selectProvince")} value="" />
          {provinces.map((p) => (
            <Picker.Item key={p.code} label={p.name} value={p.code} />
          ))}
        </Picker>

        {/* District Picker */}
        <Picker
          selectedValue={selectedDistrict}
          onValueChange={handleDistrictChange}
          style={pickerStyle}
          itemStyle={{ fontSize: 14 }}
        >
          <Picker.Item label={t("selectDistrict")} value="" />
          {districts.map((d) => (
            <Picker.Item key={d.code} label={d.name} value={d.code} />
          ))}
        </Picker>

        {/* Ward Picker */}
        <Picker
          selectedValue={selectedWard}
          onValueChange={(value) => setSelectedWard(value)}
          style={pickerStyle}
          itemStyle={{ fontSize: 14 }}
        >
          <Picker.Item label={t("selectWard")} value="" />
          {wards.map((w) => (
            <Picker.Item key={w.code} label={w.name} value={w.code} />
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
      height: 40,
      fontSize: 16,
      marginTop: 16,
      fontWeight: '600',
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