module.exports = string => {
  const last_number = string.match(/\d+/g);
  return parseInt(last_number?.[last_number.length - 1] || 0);
};