import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@app_theme_mode';

const ThemeContext = createContext({
    isDarkMode: false,
    toggleTheme: () => { },
    setDarkMode: () => { },
    setLightMode: () => { },
    useSystemTheme: () => { },
    themeSource: 'system',
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const colorScheme = useColorScheme();

    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
    const [themeSource, setThemeSource] = useState('system');

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedThemeData = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedThemeData !== null) {
                    const { theme, source } = JSON.parse(savedThemeData);
                    if (source === 'user') {
                        setIsDarkMode(theme === 'dark');
                        setThemeSource('user');
                    }
                }
            } catch (error) {
                console.log('Error loading theme', error);
            }
        };

        loadTheme();
    }, []);

    useEffect(() => {
        if (themeSource === 'system') {
            setIsDarkMode(colorScheme === 'dark');
        }
    }, [colorScheme, themeSource]);

    const saveTheme = async (theme, source) => {
        try {
            const themeData = JSON.stringify({ theme, source });
            await AsyncStorage.setItem(THEME_STORAGE_KEY, themeData);
        } catch (error) {
            console.log('Error saving theme', error);
        }
    };

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        setThemeSource('user');
        saveTheme(newTheme ? 'dark' : 'light', 'user');
    };

    const setDarkMode = () => {
        setIsDarkMode(true);
        setThemeSource('user');
        saveTheme('dark', 'user');
    };

    const setLightMode = () => {
        setIsDarkMode(false);
        setThemeSource('user');
        saveTheme('light', 'user');
    };

    const useSystemTheme = () => {
        const systemIsDark = colorScheme === 'dark';
        setIsDarkMode(systemIsDark);
        setThemeSource('system');
        saveTheme(systemIsDark ? 'dark' : 'light', 'system');
    };

    return (
        <ThemeContext.Provider
            value={{
                isDarkMode,
                toggleTheme,
                setDarkMode,
                setLightMode,
                useSystemTheme,
                themeSource,
            }}
        >
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
            {children}
        </ThemeContext.Provider>
    );
};