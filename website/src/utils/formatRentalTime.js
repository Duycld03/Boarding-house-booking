const formatRentalTime = (months, t) => {
  if (!months || isNaN(months)) return 'N/A';

  if (months < 12) {
    return `${months} ${t('time.month')}`;
  }

  const years = months / 12;
  const displayYears = Number.isInteger(years) ? years : years.toFixed(1);

  return `${displayYears} ${t('time.year')}`;
};

export default formatRentalTime;
