const path = require("path");

const Model = require("./model/model");
const modelExceptions = require("./model/exceptions");
const modes = require("./model/modes");

const Logic = require("./logic/logic");
const Controller = require("./controller/controller.js");
const Board = require("./chessboard");

// an anonymous function is called that adds 'Chessboard' to the window
// require("./chessboard");

/**
 * Creates UI of chessboard.
 */
function createBoard() {
  return Board("board", {
    position: "start",
    draggable: true
  });
}

/**
 * Constructs components for the MVC architecture.
 */
var Main = function Main() {
  this.board = createBoard();
  // decoration(this.board);

  this.logic = new Logic();
  this.model = new Model(this.board, this.logic);
  this.controller = new Controller(this.model);
};

Main.prototype.start = function() {
  this.model.setMode(modes.NORMAL);
};

module.exports = Main;
