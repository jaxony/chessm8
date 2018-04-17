/**
 * Pure UI component.
 * Only handles reward UI at the moment.
 */

var View = function View(rewardsPanelDomId) {
  this.$rewardsPanel = $("#" + rewardsPanelDomId);
};

View.prototype.addReward = function(rewardType) {
  const newElement = createRewardElement(rewardType);
  // const rewardsPanel = this.$rewardsPanel.find("#" + rewardType);
  newElement
    .hide()
    .appendTo(this.$rewardsPanel)
    .fadeIn(250);
};

View.prototype.removeReward = function(rewardElement) {
  $(rewardElement).fadeOut(250, function() {
    $(this).remove();
  });
};

/**
 * Creates a draggable jQuery element for the reward.
 * @param {String} rewardType Type of reward.
 */
function createRewardElement(rewardType) {
  return $(
    '<div class="reward ' +
      rewardType +
      '" ' +
      'data="' +
      rewardType +
      '">' +
      '<img src="../img/rewards/' +
      rewardType +
      '.png"/>' +
      "</div>"
  ).draggable({
    revert: "invalid"
  });
}

module.exports = View;
