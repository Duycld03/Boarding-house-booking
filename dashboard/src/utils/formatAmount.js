import i18n from 'i18next'; // Import i18n instance

// Tỷ giá USD/VND (có thể cấu hình hoặc lấy từ API)
const USD_TO_VND_RATE = 25000;

const formatAmount = (amount, options = {}) => {
  const {
    showCurrency = true,
    showFullFormat = false,
    customRate = USD_TO_VND_RATE,
    forceLanguage = null // Có thể force ngôn ngữ cụ thể
  } = options;

  if (!amount || amount === 0) {
    const currentLang = forceLanguage || i18n.language;
    const isVietnamese = currentLang === 'vi' || currentLang.startsWith('vi');
    return isVietnamese ? '0₫' : '$0';
  }

  // Xác định ngôn ngữ hiện tại
  const currentLang = forceLanguage || i18n.language;
  const isVietnamese = currentLang === 'vi' || currentLang.startsWith('vi');

  let finalAmount = amount;
  let currencySymbol = '';
  let locale = 'vi-VN';

  if (isVietnamese) {
    // Tiếng Việt - VND
    finalAmount = amount; // Amount đã là VND
    currencySymbol = '₫';
    locale = 'vi-VN';
  } else {
    // Tiếng Anh - USD
    finalAmount = amount / customRate; // Chuyển từ VND sang USD
    currencySymbol = '$';
    locale = 'en-US';
  }

  // Nếu yêu cầu format đầy đủ (không rút gọn)
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

  // Format rút gọn với K, M, B
  let formattedNumber = '';
  let suffix = '';

  if (finalAmount >= 1e9) {
    formattedNumber = (finalAmount / 1e9).toFixed(1);
    suffix = 'B';
  } else if (finalAmount >= 1e6) {
    formattedNumber = (finalAmount / 1e6).toFixed(1);
    suffix = 'M';
  } else if (finalAmount >= 1e3) {
    formattedNumber = (finalAmount / 1e3).toFixed(1);
    suffix = 'K';
  } else {
    if (isVietnamese) {
      formattedNumber = Math.round(finalAmount).toString();
    } else {
      formattedNumber = finalAmount.toFixed(2);
    }
  }

  // Loại bỏ .0 không cần thiết
  formattedNumber = formattedNumber.replace(/\.0$/, '');

  // Trả về kết quả
  if (showCurrency) {
    return isVietnamese
      ? `${formattedNumber}${suffix}${currencySymbol}`
      : `${currencySymbol}${formattedNumber}${suffix}`;
  } else {
    return `${formattedNumber}${suffix}`;
  }
};

// Hook để sử dụng trong React component
export const useFormatAmount = () => {
  const currentLang = i18n.language;

  return {
    formatAmount,
    formatPrice: (amount, options = {}) => formatAmount(amount, { ...options, showCurrency: true }),
    formatNumber: (amount, options = {}) => formatAmount(amount, { ...options, showCurrency: false }),
    isVietnamese: currentLang === 'vi' || currentLang.startsWith('vi'),
    currentLanguage: currentLang
  };
};

// Các function tiện ích bổ sung
export const formatPrice = (amount, options = {}) => {
  return formatAmount(amount, { ...options, showCurrency: true });
};

export const formatPriceRange = (minPrice, maxPrice, options = {}) => {
  const currentLang = options.forceLanguage || i18n.language;
  const isVietnamese = currentLang === 'vi' || currentLang.startsWith('vi');

  const fromText = isVietnamese ? 'từ' : 'from';
  const toText = isVietnamese ? 'đến' : 'to';

  if (minPrice && maxPrice) {
    return `${fromText} ${formatAmount(minPrice, options)} ${toText} ${formatAmount(maxPrice, options)}`;
  } else if (minPrice) {
    return `${fromText} ${formatAmount(minPrice, options)}`;
  } else if (maxPrice) {
    return `${toText} ${formatAmount(maxPrice, options)}`;
  }

  return isVietnamese ? 'Chưa có giá' : 'Price not available';
};

export default formatAmount;

