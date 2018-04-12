/**
 * Takes user input and tells Model to update application data.
 * NOTE: Chessboard.js handles all chessboard-related inputs.
 */
const modes = require("../model/modes.js");
const modelExceptions = require("../model/exceptions");

var Controller = function Controller(model) {
  this.model = model;
  this.registerKeyListeners();
};

Controller.prototype.registerKeyListeners = function() {
  var self = this;
  // jQuery included in window already: downloaded from CDN in ../static/index.html
  $(document).keydown(function(e) {
    if (e.which === 32) {
      // space
      self.submitThisRound();
    }
  });
};

Controller.prototype.submitThisRound = function() {
  // handles different types of 'round's
  // 'ranking', 'battleship', 'russian roulette', etc.
  const mode = this.model.getMode();
  switch (mode) {
    case modes.RANK:
      console.log("rank");
      break;
    case modes.GUESS:
      console.log("guess");
      break;
    case modes.NORMAL:
      console.log("normal");
      break;
    default:
      throw new Error(modelExceptions.INVALID_MODE);
  }
};

module.exports = Controller;
