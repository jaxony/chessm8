/**
 * Entry point of the application.
 */
var path = require("path");
var Chess = require("chess.js");
require("./static/js/chessboard");

/**
 * Returns board config Object for Chessboard.js
 */
function getBoardConfig() {
  return {
    position: "start",
    draggable: true
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
var Main = function Main() {
  this.gameBoard = createBoard();
  this.gameLogic = createLogic();
};

var main = new Main();
