/**
 * Logic component of the app. Encapsulates the chess engine and game rules.
 */

var Q = require("q");
var Chess = require("chess.js");
var utils = require("./utils.js");
var endOfLine = require("os").EOL;
var utilities = require("./utilities.js");

var Logic = function Logic() {
  this.game = new Chess();
  this.engine = new Worker("js/stockfish.js");
  this.setupEngine();
};

Logic.prototype.isReadyCommand = function() {
  var self = this;
  var deferred = Q.defer();
  var pendingData = "";

  var engineStdoutListener = function(event) {
    var data = event.data;
    if (data === "readyok") {
      self.engine.removeEventListener("message", engineStdoutListener, false);
      deferred.resolve();
    }
  };

  this.engine.addEventListener("message", engineStdoutListener, false);
  this.engine.postMessage("isready" + endOfLine);
  return deferred.promise;
};

// Logic.prototype.isReadyCommand = function() {
//   this.engine.postMessage("isready" + endOfLine);
// };

// Logic.prototype.setSkillLevel = function(skillLevel) {
//   if (!utils.isInteger(skillLevel)) return;
//   console.log("Skill Level: " + STOCKFISH_LEVEL);
//   this.engine.postMessage()
// };

Logic.prototype.setupEngine = function() {
  // this.engine.onmessage = function(event) {
  // console.log(event.data ? event.data : event);
  // };
};

module.exports = Logic;
