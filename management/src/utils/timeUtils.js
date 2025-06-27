export const formatTimeAgo = (updatedAt, t) => {
  const updatedAtTimestamp = new Date(updatedAt || new Date()).getTime();
  const now = new Date().getTime();
  const hoursAgo = Math.floor((now - updatedAtTimestamp) / 3600000);

  if (hoursAgo >= 24) {
    const daysAgo = Math.floor(hoursAgo / 24);
    return daysAgo === 1
      ? t('timeAgo.oneDayAgo')
      : t('timeAgo.manyDaysAgo', { count: daysAgo });
  } else if (hoursAgo === 1) {
    return t('timeAgo.oneHourAgo');
  } else if (hoursAgo > 1) {
    return t('timeAgo.manyHoursAgo', { count: hoursAgo });
  }

  return t('timeAgo.justPosted');
};
