// utils/timeUtils.js

export const formatTimeAgo = (updatedAt) => {
  const updatedAtTimestamp = new Date(updatedAt || new Date()).getTime();
  const now = new Date().getTime();
  const hoursAgo = Math.floor((now - updatedAtTimestamp) / 3600000);

  let timeAgoText = 'Just posted';

  if (hoursAgo >= 24) {
    const daysAgo = Math.floor(hoursAgo / 24);
    timeAgoText = daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
  } else if (hoursAgo > 1) {
    timeAgoText = `${hoursAgo} hours ago`;
  } else if (hoursAgo === 1) {
    timeAgoText = '1 hour ago';
  }

  return timeAgoText;
};
