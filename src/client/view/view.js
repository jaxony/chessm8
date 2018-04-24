/**
 * Pure UI component.
 * Only handles reward UI at the moment.
 */

const config = require("./config");

var View = function View(rewardsPanelDomId) {
  this.$rewardsPanel = $("#" + rewardsPanelDomId);
};

View.prototype.initViewForNewPlayer = function() {
  setTitle("Welcome to Chessm8")
    .then(function() {
      $("#title").hide();
      var $el = $("#stages"),
        text = "choose rank submit reward",
        words = text.split(" "),
        html = "";

      for (var i = 0; i < words.length; i++) {
        html += '<span id="' + words[i] + '">' + words[i] + "</span>";
      }

      return $el
        .html(html)
        .children()
        .hide()
        .each(function(i) {
          $(this)
            .css("opacity", 0.5)
            .delay(i * 500)
            .fadeIn(700);
        })
        .promise();
    })
    .then(function() {
      console.log($("#choose"));
      return $("#choose")
        .animate(
          {
            opacity: "1"
          },
          1000,
          function() {
            console.log("done");
          }
        )
        .promise();
    })
    .then(function() {
      return $("#rank strong")
        .animate({ opacity: 0.8 })
        .promise();
    });
};

View.prototype.initViewForReturningPlayer = function() {
  setTitle("Welcome back :)");
};

function setTitle(text) {
  return $("#title")
    .hide()
    .css("opacity", 0.5)
    .text(text)
    .fadeIn(config.FADE_IN)
    .delay(1000)
    .animate({ opacity: 0 })
    .promise();
}

function setSubtitle(text) {
  $("#subtitle")
    .hide()
    .text(text)
    .fadeIn(config.FADE_IN);
}

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
