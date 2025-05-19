import { useTheme } from '../context/ThemeProvider';

/**
 * Hook để lấy theme styling classes dựa trên trạng thái dark/light
 * @returns {{
 *   themedClasses: function,
 *   isDarkMode: boolean,
 *   themedStyle: function
 * }}
 */
export const useThemedClasses = () => {
    const { isDarkMode } = useTheme();

    /**
     * Trả về class dựa theo trạng thái theme hiện tại
     * @param {string} lightClasses - Các class cho light mode
     * @param {string} darkClasses - Các class cho dark mode
     * @returns {string} Classes tương ứng với theme hiện tại
     */
    const themedClasses = (lightClasses, darkClasses) => {
        return isDarkMode ? darkClasses : lightClasses;
    };

    /**
     * Trả về style object dựa theo trạng thái theme hiện tại
     * Cho trường hợp cần sử dụng inline styles
     * @param {Object} lightStyles - Style object cho light mode
     * @param {Object} darkStyles - Style object cho dark mode
     * @returns {Object} Style object tương ứng với theme hiện tại
     */
    const themedStyle = (lightStyles, darkStyles) => {
        return isDarkMode ? darkStyles : lightStyles;
    };

    return {
        themedClasses,
        isDarkMode,
        themedStyle
    };
};

/**
 * Constants cho theme
 */
export const ThemeColors = {
    light: {
        primary: '#3b82f6',
        background: '#ffffff',
        text: '#111827',
        secondary: '#6b7280',
        card: '#f3f4f6'
    },
    dark: {
        primary: '#60a5fa',
        background: '#111827',
        text: '#f9fafb',
        secondary: '#9ca3af',
        card: '#1f2937'
    }
};