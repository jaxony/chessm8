const Board = require("./chessboard");

// an anonymous function is called that adds 'Chessboard' to the window
// require("./chessboard");

/**
 * Creates UI of chessboard.
 */

const board = Board("board", {
  position: "start",
  draggable: true
});

module.exports = board;
