const path = require("path");

const Model = require("./model/model");
const modelExceptions = require("./model/exceptions");
const modes = require("./model/modes");

const Logic = require("./logic/logic");
const Controller = require("./controller/controller.js");
const createBoard = require("./board/board.js");
const View = require("./view/view");

/**
 * Constructs components for the MVC architecture.
 */
var Main = function Main() {
  this.boardDomId = "board";
  this.rewardsPanelDomId = "rewardsPanel";
  this.board = createBoard(this.boardDomId);
  this.view = new View(this.boardDomId, this.rewardsPanelDomId);
  this.logic = new Logic();
  this.model = new Model(this.board, this.logic, this.view);
  this.controller = new Controller(this.model);
};

Main.prototype.start = function() {
  this.model.setMode(modes.RANK);
};

module.exports = Main;
