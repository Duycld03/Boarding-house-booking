import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '@/constants/styles';
import { useTheme } from '@/context/ThemeProvider';

// List of tabs
const tabs = [
  {
    name: 'home/index',
    title: 'Home',
    iconName: 'home',
  },
  {
    name: 'explore/index',
    title: 'Explore',
    iconName: 'search',
  },
  {
    name: 'account/index',
    title: 'Account',
    iconName: 'user',
  },
];

export default function TabLayout() {
  const { isDarkMode } = useTheme();

  const themeColors = {
    active: isDarkMode ? Colors.primary || '#4da6ff' : Colors.blue,
    inactive: isDarkMode ? Colors.gray400 || '#a0a0a0' : Colors.gray,
    background: isDarkMode
      ? Colors.backgroundDark || '#121212'
      : Colors.backgroundLight || '#ffffff',
    border: isDarkMode
      ? Colors.borderDark || '#2c2c2c'
      : Colors.borderLight || '#e0e0e0',
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: themeColors.active,
        tabBarInactiveTintColor: themeColors.inactive,
        tabBarStyle: {
          backgroundColor: themeColors.background,
          borderTopColor: themeColors.border,
          ...(!isDarkMode
            ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 5,
              }
            : {
                shadowOpacity: 0,
                elevation: 0,
              }),
        },
        tabBarIcon: ({ focused, size }) => {
          const tab = tabs.find((t) => route.name === t.name);
          if (!tab) return null;
          const iconColor = focused ? themeColors.active : themeColors.inactive;
          return (
            <FontAwesome size={25} name={tab.iconName} color={iconColor} />
          );
        },
        tabBarLabel: ({ focused, color }) => {
          const tab = tabs.find((t) => route.name === t.name);
          return (
            <Text
              style={{
                color: focused ? themeColors.active : themeColors.inactive,
                fontSize: 12,
                fontWeight: '400',
              }}
            >
              {tab?.title}
            </Text>
          );
        },
      })}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
          }}
        />
      ))}
    </Tabs>
  );
}
