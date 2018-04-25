/**
 * Pure UI component.
 * Only handles reward UI at the moment.
 */

const config = require("./config");
const stages = require("../model/stages");

var View = function View(rewardsPanelDomId) {
  this.$rewardsPanel = $("#" + rewardsPanelDomId);
};

View.prototype.initViewForNewPlayer = function() {
  return setTitle("Welcome to Chessm8").then(function() {
    $("#title").hide();
    return showStages();
  });
};

/**
 * Deactivates a specific stage, for example "choose"
 * @param {String} stage Name of tbe stage, also the id of the DOM element
 */
function deactivateStage(stage) {
  return $("#" + stage)
    .animate(
      {
        opacity: 0.5
      },
      config.GLOW_STAGE_TIME
    )
    .promise()
    .then(function() {
      return $("#tutorialGif")
        .css("opacity", 1)
        .animate(
          {
            opacity: 0
          },
          config.GLOW_STAGE_TIME
        )
        .promise();
    });
}

/**
 * Activates a specific stage, for example "choose"
 * @param {String} stage Name of the stage, also the id of the DOM element
 * @param {Boolean} showTutorial Whether to show tutorial GIF
 */
View.prototype.activateStage = function(stage, showTutorial) {
  var promise;
  if (this.lastActivatedStage) {
    promise = deactivateStage(this.lastActivatedStage).then(
      activateStagePromise.bind(null, stage, showTutorial)
    );
  } else {
    promise = activateStagePromise(stage, showTutorial);
  }
  this.lastActivatedStage = stage;
  return promise;
};

function activateStagePromise(stage, showTutorial) {
  const glowPromise = $("#" + stage)
    .animate(
      {
        opacity: "1"
      },
      config.GLOW_STAGE_TIME
    )
    .promise();

  if (!showTutorial) return glowPromise;

  // show tutorial
  return glowPromise.then(function() {
    return $("#tutorialContainer")
      .append(
        '<img id="tutorialGif" src="img/tutorial/' + stage + '.gif"></img>'
      )
      .hide()
      .fadeIn(config.FADE_IN)
      .promise();
  });
}

View.prototype.initViewForReturningPlayer = function() {
  setTitle("Welcome back :)");
};

function showStages() {
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
}

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
