import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useThemedClasses } from '@/utils/useTheme';
import { useTheme } from '@/context/ThemeProvider';
import Color from '@/constants/styles/color';
import Font from '@/constants/styles/fonts';

const accountOptions = [
  { label: 'Profile', icon: 'user', path: '/profile' },
  { label: 'My Appointment', icon: 'calendar', path: '/myappointment' },
  { label: 'My Favourite', icon: 'heart', path: '/myfavorite' },
  { label: 'Watch Later', icon: 'clock-o', path: '/watchlater' },
  {
    label: 'My Report Management',
    icon: 'file-text',
    path: '/myreportmanagement',
  },
  { label: 'My Deposited Room', icon: 'home', path: '/mydepositedroom' },
  { label: 'My Renewal Request', icon: 'repeat', path: '/myrenewalrequest' },
  { label: 'My Rent Payment', icon: 'dollar', path: '/myrentpayment' },
  {
    label: 'My Deposit Refund Request',
    icon: 'undo',
    path: '/mydepositrefundrequest',
  },
  { label: 'Setting', icon: 'cog', path: '/setting' },
];

export default function Account() {
  const router = useRouter();
  const { themedClasses } = useThemedClasses();
  const { isDarkMode } = useTheme();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <ScrollView
      className={themedClasses('flex-1 bg-white', 'flex-1 bg-background-dark')}
    >
      <View className="p-5">
        <Text
          className={themedClasses(
            'text-[22px] font-bold text-title border-b border-gray-200 mb-5',
            'text-[22px] font-bold text-white border-b border-gray-700 mb-5'
          )}
          style={{ fontFamily: Font.pBold }}
        >
          Account
        </Text>

        {accountOptions.map((item, index) => (
          <Pressable
            key={index}
            onPress={() => handleNavigate(item.path)}
            className="flex-row items-center py-3 gap-3"
          >
            <FontAwesome
              name={item.icon}
              size={20}
              color={isDarkMode ? Color.white : Color.blue}
            />
            <Text
              className={themedClasses(
                'text-[16px] text-title',
                'text-[16px] text-white'
              )}
              style={{ fontFamily: Font.pSemiBold }}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
