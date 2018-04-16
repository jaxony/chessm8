const Board = require("./chessboard");

// an anonymous function is called that adds 'Chessboard' to the window
// require("./chessboard");

/**
 * Creates UI of chessboard.
 */

function createBoard(domId) {
  return Board(domId, {
    position: "start",
    draggable: true
  });
}

module.exports = createBoard;
