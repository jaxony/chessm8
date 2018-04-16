/**
 * Contains the application state.
 */

const modes = require("./modes.js");
const exceptions = require("./exceptions.js");
const utils = require("../utils");
const assert = require("assert");
const Promise = require("bluebird");

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
    player: "white",
    maxRankedMoves: 3
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

Model.prototype.submitForRankMode = function() {
  this.board.removeAnnotations();
  const playerRankedMoves = this.board.getRankedMoves();

  const movesArray = utils.convertObjectToArray(playerRankedMoves);
  // console.log(movesArray);

  // evaluate moves
  const self = this;
  Promise.mapSeries(movesArray, function(move) {
    return self.logic.evaluateMove(move);
  }).then(function(movesWithScores) {
    utils.sortMovesByScore(movesWithScores);
    // animate
    self.showFeedbackForMoves(movesWithScores);
  });
};

Model.prototype.showFeedbackForMoves = function(moves) {
  const numMoves = moves.length;
  for (var i = 0; i < numMoves; i++) {
    const move = moves[i];
    const correctRank = numMoves - i;
    console.log(typeof move.score);
    const emoji = utils.getScoreEmoji(move.score);
    this.board.annotate(move.to, emoji + " " + move.score, correctRank);
  }
};

// setTimeout(board.annotate, 1000, 'g3', null, 1000, function () {
//   $(this).prop('Counter', 0).animate({
//     Counter: 100
//   }, {
//       duration: 1000,
//       easing: 'swing',
//       step: function (now) {
//         var next = Math.ceil(now);
//         var sign = next >= 0 ? "+" : "";
//         $(this).text(sign + next);
//       }
//     });
// });

/**
 * Updates position in Model and UI, and Logic if required.
 * @param {Object} move
 */
Model.prototype.move = function(move) {
  this.logic.updatePosition(move);
  this.setPosition(this.logic.getPosition());
};

/**
 * Updates the chessboard UI component when the mode changes.
 */
Model.prototype.updateBoard = function() {
  this.resetBoard();
  switch (this.state.mode) {
    case modes.NORMAL:
      console.log("back to normal mode");
      this.updateBoardForNormalMode();
      break;
    case modes.GUESS:
      break;
    case modes.RANK:
      this.updateBoardForRankMode();
      break;
    case modes.OPPONENT:
      this.updateBoardForOpponentMode();
      break;
    default:
      throw new Error(exceptions.INVALID_MODE);
  }
};

/**
 * Handles chessboard update when mode changes to NORMAL.
 */
Model.prototype.updateBoardForNormalMode = function() {
  const self = this;
  var move = null;

  this.board.setOnDragStart(function(source, piece, position, orientation) {
    // only allow (correct) pieces to be dragged when game is still ongoing
    if (self.logic.game.in_checkmate() === true) {
      console.log("checkmate");
      return false;
    }
    if (self.logic.game.in_draw() === true) {
      console.log("draw");
      return false;
    }

    const wrongPieceRegex = self.state.player === "white" ? /^b/ : /^w/;
    if (piece.search(wrongPieceRegex) !== -1) {
      console.log("wrong piece color");
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
    console.log("On drop normal");
    const maybeMove = { from: source, to: target, promotion: "q" };
    if (!self.logic.isLegalMove(maybeMove)) {
      console.log("snapback normal in onDrop");
      console.log(self.logic.game.ascii());
      return "snapback";
    }
    move = maybeMove;
  });

  this.board.setOnSnapEnd(function() {
    console.log("Snap end normal");
    assert(move !== null);
    self.move(move);
    self.setMode(modes.OPPONENT);
  });
};

/**
 * Handles chessboard update when mode changes to OPPONENT.
 */
Model.prototype.updateBoardForOpponentMode = function() {
  // pick move: this.logic.engine
  // this. logic.
  const self = this;
  // prevent any dragging when opponent is thinking
  this.preventDragging();

  this.logic
    .getNextBestMove(this.state.position)
    .then(function(bestmove) {
      console.log(bestmove);
      self.move(bestmove);
    })
    .then(function() {
      console.log(self.logic.game.ascii());
    })
    .then(function() {
      self.setMode(modes.NORMAL);
    });
};

/**
 * Handles chessboard update when mode changes to RANK.
 */
Model.prototype.updateBoardForRankMode = function() {
  const self = this;
  this.turnOnRankMode();
};

/**
 * Helper method for the update handlers.
 */
Model.prototype.preventDragging = function() {
  this.board.setOnDragStart(function(source, piece, position, orientation) {
    return false;
  });
};

/**
 * Helper method for the update handlers.
 */
Model.prototype.turnOnRankMode = function() {
  const self = this;
  this.board.setOnDragStart(function(source, piece, position, orientation) {
    if (self.board.getNumMoveChoices() >= self.state.maxRankedMoves) {
      return false;
    }

    if (self.logic.game.in_checkmate() === true) {
      // only allow (correct) pieces to be dragged when game is still ongoing
      console.log("checkmate");
      return false;
    }

    if (self.logic.game.in_draw() === true) {
      console.log("draw");
      return false;
    }

    const wrongPieceRegex = self.state.player === "white" ? /^b/ : /^w/;
    if (piece.search(wrongPieceRegex) !== -1) {
      console.log("wrong piece color");
      return false;
    }
  });
  this.board.removeAnnotations();
  this.board.removeGhosts();
  this.board.setAddGhost(true);

  this.board.setOnDrop(function(
    source,
    target,
    piece,
    newPos,
    oldPos,
    orientation
  ) {
    const maybeMove = { from: source, to: target, promotion: "q" };
    if (!self.logic.isLegalMove(maybeMove)) return "snapback";
    setTimeout(self.board.position, 250, oldPos);
  });
};

/**
 * Helper method for the update handlers.
 */
Model.prototype.turnOffRankMode = function() {
  this.board.setAddGhost(false);
};

/**
 * Helper method for the update handlers.
 */
Model.prototype.resetBoard = function() {
  this.board.setAddGhost(false);
  this.board.setOnDragStart(null);
  this.board.setOnSnapEnd(null);
  this.board.setOnDrop(null);
};

module.exports = Model;
