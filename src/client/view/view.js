/**
 * Pure UI component.
 * Only handles reward UI at the moment.
 */

const config = require("./config");
const STAGES = require("../model/stages");

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
      return $("#tutorialContainer")
        .fadeOut(config.GLOW_STAGE_TIME, function() {
          $(this)
            .children()
            .each(function(index, element) {
              $(element).remove();
            });
        })
        .promise();
    });
}

/**
 * Activates a specific stage, for example "choose"
 * @param {Object} stage DOM id of stage element, help message and image name
 * @param {Boolean} showTutorial Whether to show tutorial GIF
 */
View.prototype.activateStage = function(stage, showTutorial) {
  console.log("Activating " + stage.id);
  if (this.lastActivatedStageId === stage.id) {
    console.log("stage already activated : skip");
    return;
  }
  const oldStageId = this.lastActivatedStageId;
  this.lastActivatedStageId = stage.id;
  var promise;
  if (oldStageId) {
    console.log("deactivating old stage: " + oldStageId);
    promise = deactivateStage(oldStageId).then(
      activateStagePromise.bind(null, stage, showTutorial)
    );
  } else {
    console.log("no need to deactivate");
    promise = activateStagePromise(stage, showTutorial);
  }
  return promise;
};

function activateStagePromise(stage, showTutorial) {
  console.log("activate stage promise for " + stage.id);
  const glowPromise = $("#" + stage.id)
    .css("opacity", 0.5)
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
        '<img class="tutorialGif" id="gif-' +
          stage.id +
          '" src="img/tutorial/' +
          stage.imgName +
          '"></img>' +
          buildHelpMessagesHTML(stage.helpMessages)
      )
      .hide()
      .fadeIn(config.FADE_IN)
      .promise();
  });
}

/**
 * Creates the <p> HTML tags for tutorial help messages.
 * @param {Array} helpMessages Array of help messages (Strings)
 */
function buildHelpMessagesHTML(helpMessages) {
  var html = "";
  for (var i = 0; i < helpMessages.length; i++) {
    html += '<p class="tutorialMessage">' + helpMessages[i] + "</p>";
  }
  return html;
}

View.prototype.disableTutorial = function() {
  $("#tutorialContainer").fadeOut(config.FADE_OUT, function() {
    $(this).remove();
  });

  $("#textBar")
    .animate({ opacity: 0 })
    .children()
    .each(function(index, element) {
      $(element).remove();
    });
};

View.prototype.initViewForReturningPlayer = function() {
  return setTitle("Welcome back :)");
};

function showStages() {
  var $el = $("#stages"),
    text =
      STAGES.CHOOSE.id +
      " " +
      STAGES.RANK.id +
      " " +
      STAGES.SUBMIT.id +
      " " +
      STAGES.REWARD.id;
  (words = text.split(" ")), (html = "");

  for (var i = 0; i < words.length; i++) {
    html += '<span id="' + words[i] + '">' + words[i] + "</span>";
  }

  return $el
    .html(html)
    .children()
    .hide()
    .each(function(i) {
      $(this)
        .css("opacity", 0.25)
        .delay(i * 300)
        .fadeIn(500);
    })
    .promise();
}

function setTitle(text) {
  return $("#title")
    .hide()
    .css("opacity", 0.5)
    .text(text)
    .delay(500)
    .fadeIn(config.FADE_IN)
    .delay(1000)
    .animate({ opacity: 0 }, config.FADE_OUT)
    .promise();
}

View.prototype.showLoader = function() {
  $(".loader")
    .css("opacity", 0)
    .show()
    .fadeTo(config.FADE_IN, 0.75);
};

View.prototype.hideLoader = function() {
  $(".loader").fadeTo(1000, 0, "swing", function() {
    $(this).hide();
  });
};

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
