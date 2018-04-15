/**
 * Logic component of the app. Encapsulates the chess engine and game rules.
 */

const Q = require("q");
const Chess = require("chess.js");
const utils = require("../utils.js");
const endOfLine = require("os").EOL;
const Engine = require("./engine");
const assert = require("assert");
const config = require("./config");

var Logic = function Logic() {
  this.game = Chess();
  this.engine = new Engine("js/stockfish.js");
  this.engine.createWorker();
};

Logic.prototype.getPosition = function() {
  return this.game.fen();
};

Logic.prototype.updatePosition = function(move) {
  const result = this.game.move(move);
  assert(result !== null);
};

Logic.prototype.isLegalMove = function(move) {
  // see if the move is legal
  const result = this.game.move(move);
  const isLegal = result !== null;
  if (isLegal) this.game.undo();
  return isLegal;
};

Logic.prototype.move = function(move) {
  assert(this.isLegalMove(move) === true);
  this.game.move(move);
};

/**
 * Evaluates move in centipawns using the chess engine.
 * @param {Object} moveObj Move object {rank:, to:, from:, score:}
 * @returns The original move object with the `score` value updated
 *          with the evaluation score in centipawns.
 */
Logic.prototype.evaluateMove = function(moveObj) {
  var lastInfo = "";

  const moveString = moveObj.from + moveObj.to; // e.g. e2e4
  const self = this;
  return this.engine
    .isReadyCommand()
    .then(function() {
      return self.engine.positionCommand(self.getPosition());
    })
    .then(function() {
      return self.engine.goCommand(
        {
          movetime: config.EVAL_TIME,
          searchmoves: moveString
        },
        function infoHandler(info) {
          lastInfo = info;
        }
      );
    })
    .then(function() {
      return self.engine.stopCommand();
    })
    .then(function() {
      // console.log("Last info: " + lastInfo);
      const score = utils.parseCentipawnEvaluation(lastInfo);
      moveObj.score = parseInt(score);
      return moveObj;
    })
    .catch(function(err) {
      console.log(err.message);
    });
};

Logic.prototype.getNextBestMove = function(position) {
  assert(this.getPosition() === position);
  this.game.load(position);
  const self = this;
  return this.engine
    .isReadyCommand()
    .then(function() {
      return self.engine.positionCommand(position);
    })
    .then(function() {
      return self.engine.goCommand({
        movetime: config.MOVETIME
      });
    })
    .then(function() {
      return self.engine.stopCommand();
    });
};

module.exports = Logic;
