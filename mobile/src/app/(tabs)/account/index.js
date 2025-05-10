import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useThemedClasses } from '@/utils/useTheme';
import { useTheme } from '@/context/ThemeProvider';
import Color from '@/constants/styles/color';
import Font from '@/constants/styles/fonts';
import { useTranslation } from 'react-i18next';

const Account = () => {
  const router = useRouter();
  const { themedClasses } = useThemedClasses();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation('account');

  const accountOptions = [
    { label: t('profile'), icon: 'user', path: '/profile' },
    { label: t('my_appointment'), icon: 'calendar', path: '/myappointment' },
    { label: t('my_favorite'), icon: 'heart', path: '/myfavorite' },
    { label: t('watch_later'), icon: 'clock-o', path: '/watchlater' },
    {
      label: t('my_report_management'),
      icon: 'file-text',
      path: '/myreportmanagement',
    },
    { label: t('my_deposited_room'), icon: 'home', path: '/mydepositedroom' },
    {
      label: t('my_renewal_request'),
      icon: 'repeat',
      path: '/myrenewalrequest',
    },
    { label: t('my_rent_payment'), icon: 'dollar', path: '/myrentpayment' },
    {
      label: t('my_deposit_refund_request'),
      icon: 'undo',
      path: '/mydepositrefundrequest',
    },
    { label: t('setting'), icon: 'cog', path: '/setting' },
  ];

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
          {t('account')}
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
};

export default Account;
