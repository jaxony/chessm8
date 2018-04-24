/**
 * Pure UI component.
 * Only handles reward UI at the moment.
 */

var View = function View(rewardsPanelDomId) {
  this.$rewardsPanel = $("#" + rewardsPanelDomId);
};

View.prototype.setTitle = function(text) {};

View.prototype.setSubtitle = function(text) {};

View.prototype.addReward = function(rewardType, description) {
  const newElement = createRewardElement(rewardType, description);
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
 * @param {String} tooltipMsg Tip for user on reward ability.
 */
function createRewardElement(rewardType, tooltipMsg) {
  return $(
    '<div class="reward ' +
      rewardType +
      '" ' +
      'data="' +
      rewardType +
      '" ' +
      'title="' +
      tooltipMsg +
      '">' +
      '<img src="./img/rewards/' +
      rewardType +
      '.png"/>' +
      "</div>"
  )
    .draggable({
      revert: "invalid"
    })
    .tooltip({
      show: {
        delay: 1000
      }
    });
}

module.exports = View;
