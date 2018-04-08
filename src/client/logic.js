/**
 * Logic component of the app. Encapsulates the chess engine and game rules.
 */

var Chess = require("chess.js");

var Logic = function Logic() {
  this.game = new Chess();
  this.engine = new Worker("js/stockfish.js");
};

Logic.prototype.setupEngine = function() {
  this.engine.onmessage = function(event) {
    console.log(event.data ? event.data : event);
  };
};

module.exports = Logic;
