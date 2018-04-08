/**
 * Entry point of the application.
 */
var path = require("path");
var Model = require("./model.js");
var Logic = require("./logic.js");
require("./static/js/chessboard");

function onDrop(source, target, piece, newPos, oldPos, orientation) {
  setTimeout(main.board.position, 250, oldPos);
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
 * Creates model for the app. Contains state.
 */

/**
 * Constructs the Main app that contains UI, Logic, etc.
 */
function Main() {
  this.board = createBoard();
  this.board.setAddGhost(true);

  this.logic = new Logic();
  this.model = new Model();
}

var main = new Main();
