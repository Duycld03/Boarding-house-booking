import i18n from 'i18next';

const coverBhType = (codeName, language) => {
    try {
        if (language) {
            // Sử dụng ngôn ngữ được chỉ định
            return i18n.t(`common:accommodation_types.${codeName}`, { lng: language }) || codeName;
        } else {
            // Sử dụng ngôn ngữ hiện tại
            return i18n.t(`common:accommodation_types.${codeName}`) || codeName;
        }
    } catch (error) {
        console.warn(`Translation error for ${codeName}:`, error);
        return codeName;
    }
};

export default coverBhType;