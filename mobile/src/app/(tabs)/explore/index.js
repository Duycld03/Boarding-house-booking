import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Animated,
  Dimensions
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
  const { t, i18n } = useTranslation('filter');
  const [loading, setLoading] = useState(false);
  const { themedClasses, isDarkMode } = useThemedClasses();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const lang = i18n.language || 'vi';
  const getTranslatedName = useCallback((item) => {
    if (!item) return '';
    const name = item.name;
    if (typeof name === 'object') {
      return lang === 'en' ? name.en || name.vi : name.vi || name.en;
    }
    return String(name);
  }, [lang]);



  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const selectedProvinceName = getTranslatedName(
    provinces.find(p => String(p.code) === String(selectedProvince))
  );
  const selectedDistrictName = districts.find(d => d.code === selectedDistrict) ? getTranslatedName(districts.find(d => d.code === selectedDistrict)) : '';
  const selectedWardName = wards.find(w => w.code === selectedWard) ? getTranslatedName(wards.find(w => w.code === selectedWard)) : '';
  const styles = getStyles(isDarkMode);
  const formatAmount = (value, lang = 'vi') => {
    if (!value && value !== 0) return lang === 'en' ? '0 ₫' : '0 ₫';
    return value.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN') + ' ₫';
  };

  // Thêm animated value để theo dõi scroll
  const scrollY = useRef(new Animated.Value(0)).current;

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
      // name: nameFilter || null,
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
        provinceCode: selectedProvince || "",
        districtCode: selectedDistrict || "",
        wardCode: selectedWard || "",
      },
    });
  };

  const fetchAreas = async () => {
    try {
      const res = await fetchProvinces();
      const mapped = res.map(p => ({
        code: String(p.code || p.id),
        name_en: p.name_en || '',
        name_vi: p.name || '',
        name: p.name || '',
      }));
      setProvinces(mapped);
    } catch (error) {
      const fallback = provincesData.map(p => ({
        code: String(p.id),
        name_en: p.name.en,
        name_vi: p.name.vi,
        name: p.name,
      }));

      setProvinces(fallback);
    }
  };



  const handleProvinceChange = async (provinceCode) => {
    const stringCode = String(provinceCode);
    setSelectedProvince(provinceCode);
    setSelectedDistrict('');
    setSelectedWard('');
    try {
      const districtsData = await fetchDistricts(stringCode);
      const mapped = districtsData.map(d => ({
        ...d,
        code: d.code || d.id,
        name_en: d.name_en || '',
        name_vi: d.name || '',
        name: d.name || '',
      }));
      setDistricts(mapped);
      setWards([]);
    } catch (err) {
      console.error("Failed to fetch districts:", err);
    }
  };

  const handleDistrictChange = async (districtCode) => {
    setSelectedDistrict(districtCode);
    setSelectedWard('');
    try {
      const wardsData = await fetchWards(districtCode);
      const mapped = wardsData.map(w => ({
        ...w,
        code: w.code || w.id,
        name_en: w.name_en || '',
        name_vi: w.name || '',
        name: w.name || '',
      }));
      setWards(mapped);
    } catch (err) {
      console.error("Failed to fetch wards:", err);
    }
  };

  // Add reset function
  const handleResetFilters = () => {
    setNameFilter("");
    setSelectedType(null);
    setRatings([]);
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedWard('');
    setCurrentPrice([0, priceRange.max]);
    setDistricts([]);
    setWards([]);
  };

  return (
    <ScreenContainer withPadding={false} className={isDarkMode ? 'bg-black' : 'bg-white'}>
      {/* Đặt animated view cho buttons ở đây, ngoài ScrollContainer */}
      <Animated.View
        style={[
          styles.floatingButtonContainer,
          {
            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)',
            shadowColor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)',
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 0],
                extrapolate: 'clamp'
              })
            }]
          }
        ]}
      >
        <View style={styles.buttonRow}>
          {/* Reset Button */}
          <Button
            variant="outline"
            onPress={handleResetFilters}
            className="flex-1 mr-2"
            fullWidth
            size="lg"
            iconPosition="left"
          >
            {t('resetFilter', 'Reset')}
          </Button>

          {/* Apply Button */}
          <Button
            variant="primary"
            onPress={handleApplyFilter}
            className="flex-1 ml-2"
            fullWidth
            size="lg"
            loading={loading}
            iconPosition="right"
          >
            {t('applyFilter', 'Apply')}
          </Button>
        </View>
      </Animated.View>

      <ScrollContainer
        contentContainerStyle={{ paddingBottom: 90 }} // Add padding to bottom to make space for floating buttons
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Modern Header with Gradient Background */}
        <View
          className={`px-5 mt-3 ${themedClasses(
            "mb-6 border-b border-gray-200 pb-4",
            "mb-6 border-b border-gray-700 pb-4"
          )}`}
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

        <View style={styles.contentContainer}>

          {/* Price Range Section */}
          <View style={[styles.filterSection, { backgroundColor: isDarkMode ? '#1e1e1e' : '#F6F7FB' }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#223263' }]}>
                💰 {t("priceRange")}
              </Text>
            </View>

            <View style={styles.priceRangeContainer}>
              <View style={styles.priceDisplayContainer}>
                <View style={[styles.priceBox, { backgroundColor: isDarkMode ? '#2a2a2a' : '#FFF' }]}>
                  <Text style={[styles.priceLabel, { color: isDarkMode ? '#9098B1' : '#9098B1' }]}>
                    {t("min")}
                  </Text>
                  <Text style={[styles.priceValue, { color: isDarkMode ? '#40BFFF' : '#40BFFF' }]}>
                    {formatAmount(currentPrice[0], lang)}
                  </Text>

                </View>

                <View style={styles.priceSeparator}>
                  <View style={[styles.separatorLine, { backgroundColor: isDarkMode ? '#40BFFF' : '#40BFFF' }]} />
                </View>

                <View style={[styles.priceBox, { backgroundColor: isDarkMode ? '#2a2a2a' : '#FFF' }]}>
                  <Text style={[styles.priceLabel, { color: isDarkMode ? '#9098B1' : '#9098B1' }]}>
                    {t("max")}
                  </Text>
                  <Text style={[styles.priceValue, { color: isDarkMode ? '#40BFFF' : '#40BFFF' }]}>
                    {formatAmount(currentPrice[1], lang)}
                  </Text>

                </View>
              </View>

              <View style={styles.sliderContainer}>
                <MultiSlider
                  values={currentPrice}
                  min={priceRange.min}
                  max={priceRange.max}
                  step={100000}
                  onValuesChange={(values) => setCurrentPrice(values)}
                  selectedStyle={{ backgroundColor: '#40BFFF' }}
                  unselectedStyle={{ backgroundColor: isDarkMode ? '#374151' : '#EBF0FF' }}
                  markerStyle={styles.sliderMarker}
                  containerStyle={styles.sliderContainerStyle}
                  trackStyle={styles.sliderTrack}
                />
              </View>
            </View>
          </View>

          {/* Type Selection Section */}
          <View style={[styles.filterSection, { backgroundColor: isDarkMode ? '#1e1e1e' : '#F6F7FB' }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#223263' }]}>
                🏠 {t("type")}
              </Text>
            </View>

            <View style={styles.typeContainer}>
              {types.map((type: any) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor: selectedType === type.value
                        ? (isDarkMode ? '#40BFFF20' : '#40BFFF15')
                        : (isDarkMode ? '#2a2a2a' : '#FFF'),
                      borderColor: selectedType === type.value ? '#40BFFF' : (isDarkMode ? '#374151' : '#EBF0FF')
                    }
                  ]}
                  onPress={() => setSelectedType(type.value)}
                >
                  <View style={styles.radioContainer}>
                    <View style={[
                      styles.radioButton,
                      {
                        backgroundColor: selectedType === type.value ? '#40BFFF' : 'transparent',
                        borderColor: selectedType === type.value ? '#40BFFF' : (isDarkMode ? '#9098B1' : '#B9C1D6')
                      }
                    ]}>
                      {selectedType === type.value && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </View>
                  <Text style={[
                    styles.typeLabel,
                    {
                      color: selectedType === type.value
                        ? '#40BFFF'
                        : (isDarkMode ? '#FFF' : '#223263')
                    }
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating Section */}
          <View style={[styles.filterSection, { backgroundColor: isDarkMode ? '#1e1e1e' : '#F6F7FB' }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#223263' }]}>
                ⭐ {t("rating")}
              </Text>
            </View>

            <View style={styles.ratingContainer}>
              {[5, 4, 3, 2, 1].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.ratingOption,
                    {
                      backgroundColor: ratings.includes(r)
                        ? (isDarkMode ? '#40BFFF20' : '#40BFFF15')
                        : (isDarkMode ? '#2a2a2a' : '#FFF'),
                      borderColor: ratings.includes(r) ? '#40BFFF' : (isDarkMode ? '#374151' : '#EBF0FF')
                    }
                  ]}
                  onPress={() => toggleRating(r)}
                >
                  <View style={styles.checkboxContainer}>
                    <View style={[
                      styles.checkbox,
                      {
                        backgroundColor: ratings.includes(r) ? '#40BFFF' : 'transparent',
                        borderColor: ratings.includes(r) ? '#40BFFF' : (isDarkMode ? '#9098B1' : '#B9C1D6')
                      }
                    ]}>
                      {ratings.includes(r) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.starsContainer}>
                    {[...Array(5)].map((_, index) => (
                      <Text key={index} style={[
                        styles.star,
                        { color: index < r ? '#FFC833' : (isDarkMode ? '#374151' : '#EBF0FF') }
                      ]}>
                        ★
                      </Text>
                    ))}
                  </View>
                  <Text style={[
                    styles.ratingText,
                    { color: ratings.includes(r) ? '#40BFFF' : (isDarkMode ? '#9098B1' : '#9098B1') }
                  ]}>
                    {t('ratingAbove', { rating: r })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location Section */}
          <View style={[styles.filterSection, { backgroundColor: isDarkMode ? '#1e1e1e' : '#F6F7FB' }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#223263' }]}>
                📍{t("address")}
              </Text>
            </View>

            <View style={styles.locationContainer}>
              {/* Province Picker */}
              <View style={styles.pickerWrapper}>
                <Text style={[styles.pickerLabel, { color: isDarkMode ? '#9098B1' : '#9098B1' }]}>
                  {t("province")}
                </Text>
                <View style={[styles.pickerContainer, { backgroundColor: isDarkMode ? '#2a2a2a' : '#FFF' }]}>
                  <Picker
                    selectedValue={selectedProvince}
                    onValueChange={(value) => {
                      setSelectedProvince(String(value));
                      handleProvinceChange(String(value));
                    }}
                    style={[styles.picker, { color: isDarkMode ? '#FFF' : '#223263' }]}
                  >
                    <Picker.Item label={t("selectProvince")} value="" />
                    {provinces.map((p) => (
                      <Picker.Item
                        key={p.code}
                        label={getTranslatedName(p)}
                        value={p.code}
                      />
                    ))}
                  </Picker>

                </View>
              </View>

              {/* District Picker */}
              <View style={styles.pickerWrapper}>
                <Text style={[styles.pickerLabel, { color: isDarkMode ? '#9098B1' : '#9098B1' }]}>
                  {t("district")}
                </Text>
                <View style={[styles.pickerContainer, { backgroundColor: isDarkMode ? '#2a2a2a' : '#FFF' }]}>
                  <Picker
                    selectedValue={selectedDistrict}
                    onValueChange={handleDistrictChange}
                    style={[styles.picker, { color: isDarkMode ? '#FFF' : '#223263' }]}
                  >
                    <Picker.Item label={t("selectDistrict")} value="" />
                    {districts.map((d) => (
                      <Picker.Item
                        key={d.code}
                        label={getTranslatedName(d)}
                        value={d.code}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Ward Picker */}
              <View style={styles.pickerWrapper}>
                <Text style={[styles.pickerLabel, { color: isDarkMode ? '#9098B1' : '#9098B1' }]}>
                  {t("ward")}
                </Text>
                <View style={[styles.pickerContainer, { backgroundColor: isDarkMode ? '#2a2a2a' : '#FFF' }]}>
                  <Picker
                    selectedValue={selectedWard}
                    onValueChange={(value) => setSelectedWard(value)}
                    style={[styles.picker, { color: isDarkMode ? '#FFF' : '#223263' }]}
                  >
                    <Picker.Item label={t("selectWard")} value="" />
                    {wards.map((w) => (
                      <Picker.Item
                        key={w.code}
                        label={getTranslatedName(w)}
                        value={w.code}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Loại bỏ phần button ở đây vì đã đưa vào Animated.View phía trên */}
      </ScrollContainer>
    </ScreenContainer >
  );
}

export default ExploreFilterScreen;

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    // Header Styles
    headerContainer: {
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDark ? '#2a2a2a' : 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    logoImage: {
      width: 30,
      height: 30,
    },
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      fontFamily: 'Poppins-Bold',
    },
    headerSubtitle: {
      fontSize: 14,
      opacity: 0.8,
      marginTop: 2,
    },

    // Content Styles
    contentContainer: {
      paddingTop: 20,
    },
    filterSection: {
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    sectionHeader: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      fontFamily: 'Poppins-SemiBold',
    },

    // Price Range Styles
    priceRangeContainer: {
      marginTop: 10,
    },
    priceDisplayContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    priceBox: {
      flex: 1,
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#EBF0FF',
    },
    priceLabel: {
      fontSize: 12,
      fontWeight: '500',
      marginBottom: 5,
    },
    priceValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    priceSeparator: {
      width: 30,
      alignItems: 'center',
    },
    separatorLine: {
      width: 20,
      height: 2,
      borderRadius: 1,
    },
    sliderContainer: {
      paddingHorizontal: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sliderMarker: {
      backgroundColor: '#40BFFF',
      height: 24,
      width: 24,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: '#FFF',
      shadowColor: '#40BFFF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    sliderContainerStyle: {
      height: 40,
    },
    sliderTrack: {
      height: 8,
      borderRadius: 4,
    },

    // Type Selection Styles
    typeContainer: {
      gap: 12,
    },
    typeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      borderRadius: 12,
      borderWidth: 2,
    },
    radioContainer: {
      marginRight: 12,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioButtonInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FFF',
    },
    typeLabel: {
      fontSize: 16,
      fontWeight: '500',
      flex: 1,
    },

    // Rating Styles
    ratingContainer: {
      gap: 12,
    },
    ratingOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      borderRadius: 12,
      borderWidth: 2,
    },
    checkboxContainer: {
      marginRight: 12,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmark: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: '700',
    },
    starsContainer: {
      flexDirection: 'row',
      marginRight: 8,
    },
    star: {
      fontSize: 16,
      marginRight: 2,
    },
    ratingText: {
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
    },

    // Location Styles
    locationContainer: {
      gap: 15,
    },
    pickerWrapper: {
      marginBottom: 5,
    },
    pickerLabel: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
    },
    pickerContainer: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#EBF0FF',
      overflow: 'hidden',
    },
    picker: {
      height: 50,
    },

    // Button Styles
    buttonContainer: {
      marginVertical: 20,
      paddingHorizontal: 20,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    buttonIcon: {
      fontSize: 16,
    },

    // Thêm styles mới cho floating buttons
    floatingButtonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#374151' : '#EBF0FF',
      zIndex: 100,
      elevation: 5,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
    },
  });