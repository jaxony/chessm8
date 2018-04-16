const path = require("path");

const Model = require("./model/model");
const modelExceptions = require("./model/exceptions");
const modes = require("./model/modes");

const Logic = require("./logic/logic");
const Controller = require("./controller/controller.js");
const Board = require("./board/board.js");

/**
 * Constructs components for the MVC architecture.
 */
var Main = function Main() {
  this.board = Board;
  this.logic = new Logic();
  this.model = new Model(this.board, this.logic);
  this.controller = new Controller(this.model);
};

Main.prototype.start = function() {
  this.model.setMode(modes.RANK);
};

module.exports = Main;