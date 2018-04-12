/**
 * Contains the application state.
 */

var modes = require("./modes.js");
var exceptions = require("./exceptions.js");

var Model = function Model(board) {
  this.board = board;
  this.state = {
    abilities: {},
    mode: modes.NORMAL
  };
};

Model.prototype.getMode = function() {
  return this.state.mode;
};

Model.prototype.setMode = function(mode) {
  if (!modes[mode]) {
    throw new Error(exceptions.INVALID_MODE);
  }
  this.state.mode = mode;
  this.updateBoard();
};

Model.prototype.updateBoard = function() {
  switch (this.state.mode) {
    case modes.NORMAL:
      this.board.setAddGhost(false);
      this.board.setOnDrop(null);
      break;
    case modes.GUESS:
      break;
    case modes.RANK:
      this.board.setAddGhost(true);
      this.board.setOnDrop(function(
        source,
        target,
        piece,
        newPos,
        oldPos,
        orientation
      ) {
        // main.board.annotate(target, "nice move");
        setTimeout(main.board.position, 250, oldPos);
      });
      break;
    default:
      throw new Error(exceptions.INVALID_MODE);
  }
};

module.exports = Model;
