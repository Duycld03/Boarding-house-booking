/**
 * Utility functions for formatting currency values
 */

/**
 * Format a number as currency with multi-language support
 * @param {number} value - The number to format
 * @param {Object} options - Formatting options
 * @param {string} options.currency - Currency code (default: 'VND')
 * @param {string} options.locale - Locale for formatting (default: 'vi-VN')
 * @param {number} options.maximumFractionDigits - Maximum number of decimal places (default: 0)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, options = {}) => {
  const {
    currency = "VND",
    locale = "vi-VN",
    maximumFractionDigits = 0,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(value || 0);
};

/**
 * Format a number as a percentage
 * @param {number} value - The number to format (0-100)
 * @param {number} decimalPlaces - Number of decimal places to show (default: 1)
 * @returns {string} Formatted percentage string with % symbol
 */
export const formatPercentage = (value, decimalPlaces = 1) => {
  return `${value.toFixed(decimalPlaces)}%`;
};

/**
 * Format a number with thousands separators based on locale
 * @param {number} value - The number to format
 * @param {string} locale - The locale for formatting (default: 'vi-VN')
 * @returns {string} Formatted number with thousand separators
 */
export const formatNumber = (value, locale = "vi-VN") => {
  return new Intl.NumberFormat(locale).format(value || 0);
};

/**
 * Format a large number with abbreviated suffixes (K, M, B) based on locale
 * @param {number} value - The number to format
 * @param {string} locale - The locale for formatting (default: 'vi-VN')
 * @returns {string} Formatted number with appropriate suffix
 */
export const formatCompactNumber = (value, locale = "vi-VN") => {
  if (value < 1000) return value.toString();

  const formatter = new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  });

  return formatter.format(value);
};
