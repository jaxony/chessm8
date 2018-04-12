/**
 * Entry point of the application.
 */
var path = require("path");
var Model = require("./model/model.js");
var modes = require("./model/modes.js");
var Logic = require("./logic.js");
require("./chessboard");

function onDrop(source, target, piece, newPos, oldPos, orientation) {
  main.board.annotate(target, "nice move");
  setTimeout(main.board.position, 250, oldPos);
}

/**
 * Returns board config Object for Chessboard.js
 */
function getBoardConfig() {
  return {
    position: "start",
    draggable: true,
    onDrop: onDrop
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
  this.board.setAddGhost(true);
  // decoration(this.board);

  this.logic = new Logic();
  this.model = new Model();
  this.registerKeyListeners();
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
    default:
      break;
  }
};

Main.prototype.registerKeyListeners = function() {
  var self = this;
  $(document).keydown(function(e) {
    // console.log("Pressed key: " + e.which);
    if (e.which === 32) {
      // space
      console.log(self);
      self.submitThisRound();
      // console.log("moves");
    } else if (e.which === 13) {
      // enter
      // switchModes();
    } else if ((e.which === 8 || e.which === 46) && canTeleport()) {
      // backspace, delete
      // teleport();
    }
  });
};

var main = new Main();
