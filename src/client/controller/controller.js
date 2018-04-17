/**
 * Takes user input and tells Model to update application data.
 * NOTE: Chessboard.js handles all chessboard-related inputs.
 */
const modes = require("../model/modes.js");
const modelExceptions = require("../model/exceptions");

var Controller = function Controller(model, boardDomId) {
  this.model = model;
  this.registerKeyListeners();
  this.makeBoardDroppable(boardDomId);
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
  const mode = this.model.getMode();
  switch (mode) {
    case modes.RANK:
      this.model.submitForRankMode();
      break;
    case modes.GUESS:
      console.log("guess");
      break;
    case modes.NORMAL:
      console.log("normal");
      break;
    case modes.AFTER_RANK:
      this.model.submitForAfterRankMode();
      break;
    default:
      throw new Error(modelExceptions.INVALID_MODE);
  }
};

Controller.prototype.makeBoardDroppable = function(boardDomId) {
  // TODO: this should be in the controller
  const self = this;
  $("#" + boardDomId).droppable({
    drop: function(event, ui) {
      const draggableList = ui.draggable;
      const draggable = draggableList[0];
      self.model.useReward(draggable);
    }
  });
};

module.exports = Controller;
