function convertTimetap(isoString) {
  const date = new Date(isoString);
  const day = `0${date.getDate()}`.slice(-2);
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default convertTimetap;
