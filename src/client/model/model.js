/**
 * Contains the application state.
 */

const modes = require("./modes.js");
const exceptions = require("./exceptions.js");
const utils = require("../utils");

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
    mode: modes.NORMAL,
    position: this.logic.getPosition()
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

Model.prototype.setPosition = function(position) {
  this.state.position = position;
};

/**
 * Updates position in Model and UI.
 * @param {Object} move
 */
Model.prototype.move = function(move) {
  this.logic.updatePosition(move);
  // update UI
  this.board.move(utils.chessjsToChessboard(move));
  this.setPosition(this.logic.getPosition());
};

Model.prototype.updateBoardForNormalMode = function() {
  const self = this;
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
    self.setPosition(self.logic.getPosition());
    self.setMode(modes.OPPONENT);
  });
};

Model.prototype.updateBoardForRankMode = function() {
  const self = this;
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
    setTimeout(self.board.position, 250, oldPos);
  });
};

/**
 * Picks best move for opponent and displays on the board.
 */
Model.prototype.updateBoardForOpponentMode = function() {
  // pick move: this.logic.engine
  // this. logic.
  const self = this;
  this.logic.getNextBestMove(this.state.position).then(function(bestmove) {
    console.log(bestmove);
    self.move(bestmove);
  });
};

Model.prototype.updateBoard = function() {
  switch (this.state.mode) {
    case modes.NORMAL:
      this.updateBoardForNormalMode();
      break;
    case modes.GUESS:
      break;
    case modes.RANK:
      this.updateBoardForRankMode();
      break;
    case modes.OPPONENT:
      // do nothing
      this.updateBoardForOpponentMode();
      break;
    default:
      throw new Error(exceptions.INVALID_MODE);
  }
};

module.exports = Model;
