const assert = require("assert");

/**
 * Checks if variable is an integer.
 */
function isInteger(n) {
  return typeof n === "number" && isFinite(n) && Math.floor(n) === n;
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
        playerRank: parseInt(key),
        from: obj[key].from,
        to: obj[key].to,
        score: null
      });
    }
  }
  return array;
}

function sortMovesByScore(movesWithScores) {
  movesWithScores.sort(function(a, b) {
    if (a.score < b.score) {
      return -1;
    } else if (a.score === b.score) {
      return 0;
    } else {
      return 1;
    }
  });
}

function getScoreEmoji(score) {
  assert(typeof score === "number");
  var emoji = "";
  if (score < 0) {
    emoji = "😔";
  } else if (score < 50) {
    emoji = "Nice! ✅";
  } else if (score < 100) {
    emoji = "Great! 🎉";
  } else if (score === 100) {
    emoji = "💯";
  } else {
    emoji = "🔥🚀🙌";
  }
  return emoji;
}

/**
 * Checks if the player's ranking of move choices is correct.
 * @param {Array} sortedMoves Array of moves in order of ascending quality.
 */
function isCorrectRanking(sortedMoves) {
  if (sortedMoves.length < 2) return false;
  for (var i = 1; i < sortedMoves.length; i++) {
    const worseMove = sortedMoves[i - 1];
    const betterMove = sortedMoves[i];
    if (worseMove.playerRank < betterMove.playerRank) return false;
  }
  return true;
}

/**
 * Checks if a specific type of storage is available in the browser.
 * @param {String} type 'sessionStorage' or 'localStorage'
 * @returns boolean
 */
function isStorageAvailable(type) {
  try {
    var storage = window[type],
      x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0
    );
  }
}

module.exports = {
  isInteger: isInteger,
  chessjsToChessboard: chessjsToChessboard,
  parseCentipawnEvaluation: parseCentipawnEvaluation,
  convertObjectToArray: convertObjectToArray,
  sortMovesByScore: sortMovesByScore,
  getScoreEmoji: getScoreEmoji,
  isCorrectRanking: isCorrectRanking,
  isStorageAvailable: isStorageAvailable
};
