/**
 * Contains the application state.
 */

const modes = require("./modes.js");
const exceptions = require("./exceptions.js");
const utils = require("../utils");
const assert = require("assert");

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
    position: this.logic.getPosition(),
    player: "white"
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
  this.board.position(position);
};

/**
 * Updates position in Model and UI, and Logic if required.
 * @param {Object} move
 */
Model.prototype.move = function(move) {
  console.log("update move =======================");
  this.logic.updatePosition(move);
  this.setPosition(this.logic.getPosition());
};

Model.prototype.updateBoardForNormalMode = function() {
  const self = this;
  this.board.setAddGhost(false);
  var move = null;

  this.board.setOnDragStart(function(source, piece, position, orientation) {
    // only allow (correct) pieces to be dragged when game is still ongoing
    const wrongPieceRegex = self.state.player === "white" ? /^b/ : /^w/;
    if (
      self.logic.game.in_checkmate() === true ||
      self.logic.game.in_draw() === true ||
      piece.search(wrongPieceRegex) !== -1
    ) {
      return false;
    }
  });

  this.board.setOnDrop(function(
    source,
    target,
    piece,
    newPos,
    oldPos,
    orientation
  ) {
    const maybeMove = { from: source, to: target, promotion: "q" };
    if (!self.logic.isLegalMove(maybeMove)) {
      return "snapback";
    }
    move = maybeMove;
  });

  this.board.setOnSnapEnd(function() {
    assert(move !== null);
    self.move(move);
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
  this.board.setAddGhost(false);
  // prevent any dragging when opponent is thinking
  this.board.setOnDragStart(function(source, piece, position, orientation) {
    return false;
  });
  this.board.setOnDrop(null);
  this.board.setOnSnapEnd(null);

  this.logic.getNextBestMove(this.state.position).then(function(bestmove) {
    console.log(bestmove);
    self.move(bestmove);
    self.setMode(modes.NORMAL);
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
