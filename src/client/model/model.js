/**
 * Contains the application state.
 */

var modes = require("./modes.js");
var exceptions = require("./exceptions.js");

/**
 * Constructs a Model object.
 * @param {Object} board Chessboardjs User interface
 * @param {Object} logic Component containing game rules and chess engine
 */
var Model = function Model(board, logic) {
  this.board = board;
  this.logic = logic;
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
  const self = this;
  switch (this.state.mode) {
    case modes.NORMAL:
      this.board.setAddGhost(false);
      this.board.setOnDrop(function(
        source,
        target,
        piece,
        newPos,
        oldPos,
        orientation
      ) {
        // see if the move is legal
        const move = self.logic.game.move({
          from: source,
          to: target,
          promotion: "q"
        });

        // illegal move
        if (move === null) return "snapback";
      });
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
