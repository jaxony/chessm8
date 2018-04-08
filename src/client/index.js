/**
 * Entry point of the application.
 */
var path = require("path");
var Chess = require("chess.js");
require("./static/js/chessboard");

function onDrop(source, target, piece, newPos, oldPos, orientation) {
  setTimeout(main.gameBoard.position, 250, oldPos);
}

/**
 * Returns board config Object for Chessboard.js
 */
function getBoardConfig() {
  return {
    position: "start",
    draggable: true,
    onDrop: onDrop
  };
}

/**
 * Creates UI of chessboard.
 */
function createBoard() {
  return Chessboard("board", getBoardConfig());
}

/**
 * Creates logic of chess game.
 */
function createLogic() {
  return new Chess();
}

/**
 * Constructs the Main app that contains UI, Logic, etc.
 */
function Main() {
  this.gameBoard = createBoard();
  this.gameLogic = createLogic();
  this.gameBoard.setAddGhost(true);
}

var main = new Main();
