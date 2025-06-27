import i18n from 'i18next';

const coverFacility = (codeName, language) => {
  try {
    return (
      i18n.t(`common:facilities.${codeName}`, {
        lng: language || i18n.language,
      }) || codeName
    );
  } catch (error) {
    console.warn(`Translation error for facility ${codeName}:`, error);
    return codeName;
  }
};

export default coverFacility;
