import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { BackHeader } from '@/components/navigation/CustomHeader';
import * as ImagePicker from 'expo-image-picker';
import Text from '@/components/ui/Text';

const MOCK_USER = {
  username: 'johndoe',
  fullname: 'John Doe',
  phoneNumber: '0987654321',
  gender: 'male',
  email: 'johndoe@example.com',
  role: 'owner',
  accountBalance: 1500000,
  avatarImage: null,
};

const genders = ['male', 'female', 'other'];

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(MOCK_USER);
  const [avatar, setAvatar] = useState(MOCK_USER.avatarImage);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.IMAGE,
      quality: 1,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <BackHeader title="Profile" />
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{
              uri:
                avatar ||
                'https://cdn-icons-png.flaticon.com/512/847/847969.png',
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={styles.username}>@{user.username}</Text>
      </View>

      <View style={styles.formBox}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.row}>
          <TextInput style={styles.input} value={user.email} editable={false} />
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setShowEmailModal(true)}
          >
            <Text style={styles.changeButtonText}>Change Email</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={user.fullname}
          placeholder="Enter your fullname"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={user.phoneNumber}
          keyboardType="number-pad"
          placeholder="Enter your phone number"
        />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderRow}>
          {genders.map((g) => (
            <TouchableOpacity
              key={g}
              style={styles.radioItem}
              onPress={() => setUser({ ...user, gender: g })}
            >
              <View style={styles.radioCircle}>
                {user.gender === g && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
  },
  username: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  balanceBox: { marginVertical: 10 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 6 },
  value: { fontSize: 16 },
  formBox: { marginTop: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flex: 1,
  },

  changeButton: {
    height: 48, // ✅ chiều cao cố định giống với TextInput
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#1677ff',
  },

  changeButtonText: { color: '#fff', fontWeight: '600' },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  genderSelected: { color: '#1677ff', fontWeight: 'bold' },
  genderUnselected: { color: '#666' },
  saveButton: {
    backgroundColor: '#1677ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    alignSelf: 'center',
  },

  saveButtonText: { color: '#fff', fontWeight: '600' },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1677ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1677ff',
  },

  radioLabel: {
    fontSize: 16,
    color: '#000',
  },
});
