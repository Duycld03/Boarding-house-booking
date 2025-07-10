// utils/addressHelper.js

import { provinceMap, districtMap, wardMap } from './addressMapping';

const getLocalizedAddress = (address = {}, lang = 'vi') => {
  const { province, district, ward, detail } = address;

  const getTranslated = (value, map) => {
    if (!value) return '';
    return map[value]?.[lang] || value;
  };

  const parts = [
    detail,
    getTranslated(ward, wardMap),
    getTranslated(district, districtMap),
    getTranslated(province, provinceMap),
  ].filter(Boolean);

  return parts.join(', ');
};

export default getLocalizedAddress;
