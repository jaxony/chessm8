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
      // return self.engine.printCommand(function(data) {
      // console.log("Print: " + data);
      // });
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
