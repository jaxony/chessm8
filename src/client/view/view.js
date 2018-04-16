/**
 * Pure UI component.
 */

var View = function View(boardDomId, rewardsPanelDomId) {
  this.$rewardsPanel = $("#" + rewardsPanelDomId);
  this.makeBoardDroppable(boardDomId);
};

View.prototype.makeBoardDroppable = function(boardDomId) {
  $("#" + boardDomId).droppable({
    drop: function(event, ui) {
      const draggable = ui.draggable;
      $(draggable[0]).fadeOut(250, function() {
        $(this).remove();
      });
    }
  });
};

View.prototype.addReward = function(rewardType) {
  const newElement = createRewardElement(rewardType);
  // const rewardsPanel = this.$rewardsPanel.find("#" + rewardType);
  newElement
    .hide()
    .appendTo(this.$rewardsPanel)
    .fadeIn(250);
};

View.prototype.removeReward = function(rewardType) {};

/**
 * Creates a draggable jQuery element for the reward.
 * @param {String} rewardType Type of reward.
 */
function createRewardElement(rewardType) {
  return $(
    '<div class="reward ' +
      rewardType +
      '">' +
      '<img src="../img/rewards/' +
      rewardType +
      '.png"/>' +
      "</div>"
  ).draggable();
}

module.exports = View;
