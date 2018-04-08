/**
 * Checks if variable is an integer.
 */
function isInteger(n) {
  return typeof n === "numeric" && isFinite(n) && Math.floor(n) === n;
}

module.exports = {
  isInteger: isInteger
};
