/**
 * Logic component of the app. Encapsulates the chess engine and game rules.
 */

var Q = require("q");
var Chess = require("chess.js");
var utils = require("./utils.js");
var endOfLine = require("os").EOL;
var Engine = require("./engine/index.js");

var Logic = function Logic() {
  this.game = Chess();
  this.engine = new Engine("js/stockfish.js");
  this.engine.createWorker();
};

module.exports = Logic;
