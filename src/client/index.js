/**
 * Entry point of the application.
 */
var path = require("path");
var Model = require("./model/model.js");
var modes = require("./model/modes.js");
var Logic = require("./logic.js");
var modelExceptions = require("./model/exceptions");
require("./chessboard");

/**
 * Returns board config Object for Chessboard.js
 */
function getBoardConfig() {
  return {
    position: "start",
    draggable: true
  };
}

/**
 * Creates UI of chessboard.
 */
function createBoard() {
  return Chessboard("board", getBoardConfig());
}

/**
 * Creates model for the app. Contains state.
 */

function decoration(board) {
  board.annotate("e4", "Nice move!");
  board.annotate("a8", "Cool!", 10000);
  setTimeout(board.annotate, 3000, "g3", null, 3000, function() {
    $(this)
      .prop("Counter", 0)
      .animate(
        {
          Counter: 100
        },
        {
          duration: 1000,
          easing: "swing",
          step: function(now) {
            var next = Math.ceil(now);
            var sign = next >= 0 ? "+" : "";
            $(this).text(sign + next);
          }
        }
      );
  });
}

/**
 * Constructs the Main app that contains UI, Logic, etc.
 */
var Main = function Main() {
  this.board = createBoard();
  // decoration(this.board);

  this.logic = new Logic();
  this.model = new Model(this.board);
  this.registerKeyListeners();
};

Main.prototype.start = function() {
  this.setMode(modes.NORMAL);
};

Main.prototype.registerKeyListeners = function() {
  var self = this;
  $(document).keydown(function(e) {
    // console.log("Pressed key: " + e.which);
    if (e.which === 32) {
      // space
      self.submitThisRound();
    } else if (e.which === 13) {
      // enter
      // switchModes();
    } else if ((e.which === 8 || e.which === 46) && canTeleport()) {
      // backspace, delete
      // teleport();
    }
  });
};

Main.prototype.submitThisRound = function() {
  // handles different types of 'round's
  // 'ranking', 'battleship', 'russian roulette', etc.
  var mode = this.model.getMode();
  switch (mode) {
    case modes.RANK:
      console.log("rank");
      break;
    case modes.GUESS:
      console.log("guess");
      break;
    case modes.NORMAL:
      console.log("normal");
      this.handleNormalMode();
      break;
    default:
      throw new Error(modelExceptions.INVALID_MODE);
  }
};

Main.prototype.setMode = function(mode) {
  this.model.setMode(mode);
};

Main.prototype.handleNormalMode = function() {
  // user's first move is immediately committed as the move
};

var main = new Main();
main.start();
