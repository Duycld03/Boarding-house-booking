const getLocalizedAddress = (address, lang = 'vi') => {
  if (!address) return '';

  const getValue = (key) =>
    lang === 'en' && address[`${key}_en`] ? address[`${key}_en`] : address[key];

  return `${address.detail || ''}, ${getValue('ward')}, ${getValue(
    'district'
  )}, ${getValue('province')}`;
};

export default getLocalizedAddress;
