/**
 * Contains the application state.
 */

const exceptions = require("./exceptions.js");
const utils = require("../utils");
const viewConfig = require("../view/config");
const modelConfig = require("./config");

const MODES = require("./modes.js");
const REWARDS = require("./rewards");
const STORAGE_KEYS = require("./storageKeys");

const assert = require("assert");
const Promise = require("bluebird");

/**
 * Constructs a Model object.
 * @param {Object} board Chessboardjs User interface with ranking state
 * @param {Object} logic Component containing game rules and chess engine
 * @param {Object} view Pure UI component for rewards
 */
var Model = function Model(board, logic, view) {
  this.board = board;
  this.logic = logic;
  this.view = view;
  this.state = {
    rewards: {},
    activeRewards: [],
    mode: MODES.NORMAL,
    stage: STAGES.CHOOSE,
    position: this.logic.getPosition(),
    player: modelConfig.PLAYER_SIDE,
    maxRankedMoves: modelConfig.MAX_RANKED_MOVES,
    stockfishLevel: modelConfig.STOCKFISH_LEVEL,
    hasLocalStorage: utils.isStorageAvailable("localStorage"),
    isNewPlayer: false
  };
  this.logic.setStockfishLevel(this.state.stockfishLevel);
  this.setPlayerType();
  this.initView();
  this.rewardTypes = createRewardTypesArray(REWARDS);
};

function createRewardTypesArray(rewardsObj) {
  const rewardTypes = new Array();
  for (var rewardType in rewardsObj) {
    if (rewardsObj.hasOwnProperty(rewardType)) {
      rewardTypes.push(rewardsObj[rewardType].id);
    }
  }
  return rewardTypes;
}

/**
 * Checks if user has played the app before by using localStorage.
 * @returns boolean
 */
function hasUserPlayedBefore() {
  return localStorage.getItem(STORAGE_KEYS.LAST_SIGN_IN_TIMESTAMP);
}

function updateSigninTimestamp() {
  localStorage.setItem(
    STORAGE_KEYS.LAST_SIGN_IN_TIMESTAMP,
    new Date().toUTCString()
  );
  console.log(
    "Model: " +
      STORAGE_KEYS.LAST_SIGN_IN_TIMESTAMP +
      " set to " +
      localStorage.getItem(STORAGE_KEYS.LAST_SIGN_IN_TIMESTAMP)
  );
}

/**
 * Initialize the view at load.
 */
Model.prototype.initView = function() {
  if (!this.state.hasLocalStorage) return;
  const self = this;
  if (this.state.isNewPlayer) {
    console.log("Model: User has not played before!");
    this.view
      .initViewForNewPlayer()
      .then(function() {
        return self.view.activateStage("choose", true);
      })
      .then(function() {
        return self.view.activateStage("rank", false);
      });
  } else {
    console.log("Model: User has played before!");
    this.view.initViewForReturningPlayer().then(function() {
      // return self.view.activateStage("choose", true);
    });
  }
  updateSigninTimestamp();
  localStorage.clear();
};

Model.prototype.setPlayerType = function() {
  if (!this.state.hasLocalStorage) return;
  this.state.isNewPlayer = !hasUserPlayedBefore();
};

Model.prototype.getMode = function() {
  return this.state.mode;
};

Model.prototype.setMode = function(mode) {
  if (!MODES[mode]) {
    throw new Error(exceptions.INVALID_MODE);
  }
  this.state.mode = mode;
  this.updateBoard();
};

Model.prototype.setPosition = function(position) {
  this.state.position = position;
  this.board.position(position);
};

/**
 * Chooses a reward for the player.
 * @returns {Object} JavaScript Object containing `id` and `description` values.
 */
Model.prototype.chooseReward = function() {
  const randomIndex = Math.floor(Math.random() * this.rewardTypes.length);
  const rewardType = this.rewardTypes[randomIndex];
  return REWARDS[rewardType];
};

Model.prototype.rewardPlayer = function(reward) {
  if (!reward) var reward = this.chooseReward();
  if (this.state.rewards[reward.id]) {
    this.state.rewards[reward.id] += 1;
  } else {
    this.state.rewards[reward.id] = 1;
  }
  this.view.addReward(reward.id, reward.description);
};

Model.prototype.useReward = function(rewardElement) {
  const rewardTypeId = $(rewardElement).attr("data");
  console.log(this.state.rewards);
  if (!this.state.rewards[rewardTypeId]) {
    throw new Error(exceptions.REWARD_REMOVAL_EXCEPTION);
  }
  if (this.canActivateReward(rewardTypeId)) {
    this.activateReward(rewardTypeId, rewardElement);
  } else {
    console.log("Can't activate award!");
  }
};

Model.prototype.canActivateReward = function(rewardTypeId) {
  return !this.state.activeRewards.includes(rewardTypeId);
};

Model.prototype.activateReward = function(rewardTypeId, rewardElement) {
  this.state.rewards[rewardTypeId] -= 1;
  this.state.activeRewards.push(rewardTypeId);

  switch (rewardTypeId) {
    case REWARDS.MAX_FIVE_CHOICES.id:
      this.state.maxRankedMoves = 5;
      break;
    case REWARDS.SERVER_CHOOSES_BEST_MOVE.id:
      // do nothing: this reward is handled in Model#choosePlayerMove for now
      break;
    default:
      throw new Error(exceptions.INVALID_REWARD);
  }
  this.view.removeReward(rewardElement);
};

Model.prototype.clearActiveRewards = function() {
  this.state.activeRewards = [];
};

Model.prototype.choosePlayerMove = function(playerRankedMoves, sortedMoves) {
  if (this.state.activeRewards.includes(REWARDS.SERVER_CHOOSES_BEST_MOVE.id)) {
    const moveObj = sortedMoves[sortedMoves.length - 1];
    var move = { from: moveObj.from, to: moveObj.to };
    console.log("Make this server move: ");
  } else {
    var move = playerRankedMoves["1"];
    // console.log("Make this player move: " + move);
  }
  console.log(move);
  this.move(move);
};

Model.prototype.submitForRankMode = function() {
  console.log(this.state.activeRewards);
  if (this.board.getNumMoveChoices() === 0) return;

  this.board.freezeRankings();
  this.board.removeAnnotations();

  const playerRankedMoves = this.board.getRankedMoves();
  const movesArray = utils.convertObjectToArray(playerRankedMoves);

  const self = this;
  var sortedMoves;
  Promise.mapSeries(movesArray, function(move) {
    return self.logic.evaluateMove(move);
  })
    .then(function(movesWithScores) {
      utils.sortMovesByScore(movesWithScores);
      sortedMoves = movesWithScores;

      // animate
      return self.showFeedbackForMoves(movesWithScores);
    })
    .then(function() {
      if (utils.isCorrectRanking(sortedMoves)) {
        self.rewardPlayer();
      }
      // move the player's first-choice move
      self.choosePlayerMove(playerRankedMoves, sortedMoves);

      // clean up
      self.resetStateAfterRankMode();
      self.setMode(MODES.AFTER_RANK);
    });
};

Model.prototype.resetStateAfterRankMode = function() {
  this.state.player = modelConfig.PLAYER_SIDE;
  this.state.maxRankedMoves = modelConfig.MAX_RANKED_MOVES;
  this.clearActiveRewards();
  // this.stockfishLevel = modelConfig.STOCKFISH_LEVEL;
};

Model.prototype.submitForAfterRankMode = function() {
  clearTimeout(this.afterRankTimeout);
  this.setMode(MODES.OPPONENT);
};

Model.prototype.showFeedbackForMoves = function(moves) {
  const self = this;

  return Promise.mapSeries(moves, function(move, index, numMoves) {
    const correctRank = numMoves - index;
    const emoji = utils.getScoreEmoji(move.score);
    return self.board.annotate(
      move.from, // square to annotate
      null, // no annotation
      correctRank, // for border colour
      emoji, // decoration
      viewConfig.ANNOTATION_LIFETIME, // disappear after msecs
      function() {
        $(this)
          .prop("Counter", 0)
          .animate(
            {
              Counter: move.score
            },
            {
              duration: Math.max(500, move.score * 10),
              easing: "swing",
              step: function(now) {
                const next = Math.ceil(now);
                const sign = next >= 0 ? "+" : "";
                $(this).text(sign + next);
              }
            }
          );
      }
    );
  });
};

/**
 * Updates position in Model and UI, and Logic if required.
 * @param {Object} move
 */
Model.prototype.move = function(move) {
  this.logic.updatePosition(move);
  this.setPosition(this.logic.getPosition());
};

/**
 * Updates the chessboard UI component when the mode changes.
 */
Model.prototype.updateBoard = function() {
  switch (this.state.mode) {
    case MODES.NORMAL:
      this.resetBoard();
      this.updateBoardForNormalMode();
      break;
    case MODES.GUESS:
      break;
    case MODES.RANK:
      this.resetBoard();
      this.updateBoardForRankMode();
      break;
    case MODES.OPPONENT:
      this.resetBoard();
      this.updateBoardForOpponentMode();
      break;
    case MODES.AFTER_RANK:
      // do not reset board
      this.updateBoardForAfterRankMode();
      break;
    default:
      throw new Error(exceptions.INVALID_MODE);
  }
};

/**
 * Handles chessboard update when mode changes to NORMAL.
 */
Model.prototype.updateBoardForNormalMode = function() {
  const self = this;
  var move = null;

  this.board.setOnDragStart(function(source, piece, position, orientation) {
    // only allow (correct) pieces to be dragged when game is still ongoing
    if (self.logic.game.in_checkmate() === true) {
      console.log("checkmate");
      return false;
    }
    if (self.logic.game.in_draw() === true) {
      console.log("draw");
      return false;
    }

    const wrongPieceRegex = self.state.player === "white" ? /^b/ : /^w/;
    if (piece.search(wrongPieceRegex) !== -1) {
      console.log("wrong piece color");
      return false;
    }
  });

  this.board.setOnDrop(function(
    source,
    target,
    piece,
    newPos,
    oldPos,
    orientation
  ) {
    console.log("On drop normal");
    const maybeMove = { from: source, to: target, promotion: "q" };
    if (!self.logic.isLegalMove(maybeMove)) {
      console.log("snapback normal in onDrop");
      console.log(self.logic.game.ascii());
      return "snapback";
    }
    move = maybeMove;
  });

  this.board.setOnSnapEnd(function() {
    console.log("Snap end normal");
    assert(move !== null);
    self.move(move);
    self.setMode(MODES.OPPONENT);
  });
};

/**
 * Handles chessboard update when mode changes to OPPONENT.
 */
Model.prototype.updateBoardForOpponentMode = function() {
  const self = this;
  // prevent any dragging when opponent is thinking
  this.preventDragging();

  this.logic
    .getNextBestMove(this.state.position)
    .then(function(bestmove) {
      console.log(bestmove);
      self.move(bestmove);
    })
    .then(function() {
      console.log(self.logic.game.ascii());
    })
    .then(function() {
      self.setMode(MODES.RANK);
    });
};

/**
 * Handles chessboard update when mode changes to RANK.
 */
Model.prototype.updateBoardForRankMode = function() {
  const self = this;
  this.turnOnRankMode();
};

/**
 * Handles chessboard update when mode changes to AFTER_RANK.
 */
Model.prototype.updateBoardForAfterRankMode = function() {
  this.preventDragging();

  // wait for user to do something in controller
  // or wait for automatic switching to next mode
  this.afterRankTimeout = setTimeout(
    this.setMode.bind(this),
    modelConfig.AFTER_RANK_WAIT_TIME,
    MODES.OPPONENT
  );
};

/**
 * Helper method for the update handlers.
 */
Model.prototype.preventDragging = function() {
  this.board.setOnDragStart(function(source, piece, position, orientation) {
    return false;
  });
};

/**
 * Helper method for the update handlers.
 */
Model.prototype.turnOnRankMode = function() {
  const self = this;

  // board logic
  this.board.setAddGhost(true);
  this.board.allowReranking();

  // board event callbacks
  this.board.setOnDragStart(function(source, piece, position, orientation) {
    if (self.board.getNumMoveChoices() >= self.state.maxRankedMoves) {
      self.board.annotate(source, "No more choices left!", null, null, 750);
      return false;
    }

    if (self.logic.game.in_checkmate() === true) {
      // only allow (correct) pieces to be dragged when game is still ongoing
      console.log("checkmate");
      return false;
    }

    if (self.logic.game.in_draw() === true) {
      console.log("draw");
      return false;
    }

    const wrongPieceRegex = self.state.player === "white" ? /^b/ : /^w/;
    if (piece.search(wrongPieceRegex) !== -1) {
      console.log("wrong piece color");
      return false;
    }
  });

  this.board.setOnDrop(function(
    source,
    target,
    piece,
    newPos,
    oldPos,
    orientation
  ) {
    const maybeMove = { from: source, to: target, promotion: "q" };
    if (!self.logic.isLegalMove(maybeMove)) return "snapback";
    setTimeout(self.board.position, 250, oldPos);
  });
};

/**
 * Helper method for the update handlers.
 */
Model.prototype.resetBoard = function() {
  // board logic
  this.board.setAddGhost(false);
  this.board.freezeRankings();
  this.board.clearMoveChoices();

  // board UI
  this.board.removeAnnotations();
  this.board.removeShadedSquares();
  this.board.removeGhosts();

  // board event callbacks
  this.board.setOnDragStart(null);
  this.board.setOnSnapEnd(null);
  this.board.setOnDrop(null);
};

module.exports = Model;
