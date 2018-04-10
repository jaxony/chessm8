/**
 * Entry point of the application.
 */
var path = require("path");
var Model = require("./model.js");
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
function Main() {
  this.board = createBoard();
  this.board.setAddGhost(true);
  decoration(this.board);

  this.logic = new Logic();
  this.model = new Model();

  var self = this;
  self.logic.engine
    .isReadyCommand()
    .then(function() {
      return self.logic.engine.positionCommand("startpos");
    })
    .then(function() {
      return self.logic.engine.goCommand(
        {
          movetime: 3000,
          searchmoves: "e2e4"
        },
        function infoHandler(info) {
          console.log(info);
        }
      );
    })
    .then(function() {
      return self.logic.engine.stopCommand();
    })
    .then(function(bestmove) {
      console.log("Bestmove: ");
      console.log(bestmove);
    });
  console.log("Before promise");
}

var main = new Main();
