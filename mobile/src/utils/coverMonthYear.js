const convertMonthYear = (month, year, currentLanguage) => {
    // Validate input
    if (!month || !year) {
        return 'N/A';
    }

    // Ensure month is between 1-12
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum) || isNaN(yearNum)) {
        return 'Invalid date';
    }

    // Create date object (month is 0-indexed in JavaScript Date)
    const date = new Date(yearNum, monthNum - 1);

    // Define locale mapping
    const localeMap = {
        'vi': 'vi-VN',
        'en': 'en-US',
        'zh': 'zh-CN',
        'ja': 'ja-JP',
        'ko': 'ko-KR'
    };

    // Get locale based on current language, default to Vietnamese
    const locale = localeMap[currentLanguage] || 'vi-VN';

    // Format options
    const formatOptions = {
        month: 'long',
        year: 'numeric'
    };

    try {
        return date.toLocaleDateString(locale, formatOptions);
    } catch (error) {
        const monthNames = {
            vi: [
                'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
            ],
            en: [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ]
        };

        const months = monthNames[currentLanguage] || monthNames.vi;
        return `${months[monthNum - 1]} ${yearNum}`;
    }
};

export default convertMonthYear;
