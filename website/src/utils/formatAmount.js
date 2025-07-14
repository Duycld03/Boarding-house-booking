const USD_TO_VND_RATE = 25000;

// Format amount với language bắt buộc
const formatAmount = (amount, language = 'en', options = {}) => {
  const {
    showCurrency = true,
    showFullFormat = false,
    customRate = USD_TO_VND_RATE,
  } = options;

  // Language là bắt buộc
  if (!language) {
    throw new Error('Language is required. Please provide "vi" for Vietnamese or "en" for English');
  }

  if (!amount || amount === 0) {
    const isVietnamese = language === 'vi' || language.startsWith('vi');
    return isVietnamese ? '0₫' : '$0';
  }

  // Xác định ngôn ngữ
  const isVietnamese = language === 'vi' || language.startsWith('vi');

  let finalAmount = amount;
  let currencySymbol = '';
  let locale = 'vi-VN';

  if (isVietnamese) {
    finalAmount = amount;
    currencySymbol = ' ₫';
    locale = 'vi-VN';
  } else {
    finalAmount = amount / customRate;
    currencySymbol = ' $';
    locale = 'en-US';
  }

  if (showFullFormat) {
    if (showCurrency) {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: isVietnamese ? 'VND' : 'USD',
        minimumFractionDigits: isVietnamese ? 0 : 2,
        maximumFractionDigits: isVietnamese ? 0 : 2
      }).format(finalAmount);
    } else {
      return new Intl.NumberFormat(locale).format(finalAmount);
    }
  }

  let formattedNumber = '';
  let suffix = '';

  // Lưu trữ dấu của số ban đầu
  const absAmount = Math.abs(finalAmount);
  const isNegative = finalAmount < 0;

  // Định nghĩa các hậu tố theo ngôn ngữ
  const suffixes = isVietnamese
    ? { thousand: 'K', million: 'Tr', billion: 'Tỷ' }
    : { thousand: 'K', million: 'M', billion: 'B' };

  if (absAmount >= 1e9) {
    formattedNumber = (absAmount / 1e9).toFixed(1);
    suffix = suffixes.billion;
  } else if (absAmount >= 1e6) {
    formattedNumber = (absAmount / 1e6).toFixed(1);
    suffix = suffixes.million;
  } else if (absAmount >= 1e3) {
    formattedNumber = (absAmount / 1e3).toFixed(1);
    suffix = suffixes.thousand;
  } else {
    if (isVietnamese) {
      formattedNumber = Math.round(absAmount).toString();
    } else {
      formattedNumber = absAmount.toFixed(2);
    }
  }

  formattedNumber = formattedNumber.replace(/\.0$/, '');

  // Thêm dấu âm trước số nếu cần
  if (isNegative) {
    formattedNumber = '-' + formattedNumber;
  }

  if (showCurrency) {
    return isVietnamese
      ? `${formattedNumber}${suffix}${currencySymbol}`
      : `${currencySymbol}${formattedNumber}${suffix}`;
  } else {
    return `${formattedNumber}${suffix}`;
  }
};

// Hook đơn giản không phụ thuộc i18n
export const useFormatAmount = (language) => {
  // Language là bắt buộc
  if (!language) {
    console.warn('Language is required for useFormatAmount hook');
  }

  const isVietnamese = language === 'vi' || language?.startsWith('vi');

  return {
    formatAmount: (amount, options = {}) => formatAmount(amount, language, options),
    formatPrice: (amount, options = {}) => formatAmount(amount, language, { ...options, showCurrency: true }),
    formatNumber: (amount, options = {}) => formatAmount(amount, language, { ...options, showCurrency: false }),
    isVietnamese,
    currentLanguage: language
  };
};

// Utility functions với language parameter
export const formatPrice = (amount, language, options = {}) => {
  return formatAmount(amount, language, { ...options, showCurrency: true });
};

export const formatNumber = (amount, language, options = {}) => {
  return formatAmount(amount, language, { ...options, showCurrency: false });
};

export const formatPriceRange = (minPrice, maxPrice, language, options = {}) => {
  if (!language) {
    throw new Error('Language is required for formatPriceRange');
  }

  const isVietnamese = language === 'vi' || language.startsWith('vi');
  const fromText = isVietnamese ? 'từ' : 'from';
  const toText = isVietnamese ? 'đến' : 'to';

  if (minPrice && maxPrice) {
    return `${fromText} ${formatAmount(minPrice, language, options)} ${toText} ${formatAmount(maxPrice, language, options)}`;
  } else if (minPrice) {
    return `${fromText} ${formatAmount(minPrice, language, options)}`;
  } else if (maxPrice) {
    return `${toText} ${formatAmount(maxPrice, language, options)}`;
  }

  return isVietnamese ? 'Chưa có giá' : 'Price not available';
};

// Helper function để tạo formatter với language cố định
export const createFormatter = (language) => {
  return {
    formatAmount: (amount, options = {}) => formatAmount(amount, language, options),
    formatPrice: (amount, options = {}) => formatPrice(amount, language, options),
    formatNumber: (amount, options = {}) => formatNumber(amount, language, options),
    formatPriceRange: (minPrice, maxPrice, options = {}) => formatPriceRange(minPrice, maxPrice, language, options),
    isVietnamese: language === 'vi' || language?.startsWith('vi'),
    language
  };
};

export default formatAmount;