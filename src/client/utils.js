/**
 * Checks if variable is an integer.
 */
function isInteger(n) {
  return typeof n === "numeric" && isFinite(n) && Math.floor(n) === n;
}

/**
 * Converts JSON object to '`from`-`to`' string
 */
function chessjsToChessboard(move) {
  return move.from + "-" + move.to;
}

module.exports = {
  isInteger: isInteger,
  chessjsToChessboard: chessjsToChessboard
};
