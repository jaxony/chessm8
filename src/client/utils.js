const assert = require("assert");

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

function parseCentipawnEvaluation(infoLine) {
  assert(infoLine !== null);
  const cpRegex = /cp (-?[0-9]+)/;
  var match = cpRegex.exec(infoLine);
  if (match) {
    var cp = match[1];
    return cp;
  }
  // mate
  // var mateRegex = /mate ([0-9]+)/;
  // match = mateRegex.exec(infoLine);
  // var mateInNMoves = match[1];
  // return makeInNMoves;
  return -100000; // basically lost as checkmate soon!
}

/**
 * Converts move Object to an Array.
 * @param {Object} obj Move object from chessboardjs.
 */
function convertObjectToArray(obj) {
  const array = new Array();
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      array.push({
        playerRank: key,
        from: obj[key].from,
        to: obj[key].to,
        score: null
      });
    }
  }
  return array;
}

module.exports = {
  isInteger: isInteger,
  chessjsToChessboard: chessjsToChessboard,
  parseCentipawnEvaluation: parseCentipawnEvaluation,
  convertObjectToArray: convertObjectToArray
};
