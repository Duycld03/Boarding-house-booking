const formatAmount = (amount) => {
  if (amount >= 1e9) {
    return (amount / 1e9).toFixed(1) + 'B';
  } else if (amount >= 1e6) {
    return (amount / 1e6).toFixed(1) + 'M';
  } else if (amount >= 1e3) {
    return (amount / 1e3).toFixed(1) + 'K';
  }
  return amount;
};

export default formatAmount;
