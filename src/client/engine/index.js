var Q = require("q");
var endOfLine = require("os").EOL;
var os = require("os");
var utilities = require("./utilities.js");

var Engine = function Engine(enginePath) {
  this.enginePath = enginePath;
};

Engine.prototype.createWorker = function() {
  this.engine = new Worker(this.enginePath);
};

Engine.prototype.isReadyCommand = function() {
  console.log("IS READY COMMAND INVOKED");
  var self = this;
  var deferred = Q.defer();

  var engineStdoutListener = function(event) {
    var data = event.data;
    console.log(data);
    if (data === "readyok") {
      self.engine.removeEventListener("message", engineStdoutListener, false);
      deferred.resolve();
    }
  };

  this.engine.addEventListener("message", engineStdoutListener, false);
  this.engine.postMessage("isready" + endOfLine);
  return deferred.promise;
};

Engine.prototype.setOptionCommand = function(optionName, optionValue) {
  //TODO:parse options from uci command and if option type is button, call the setoption on if optionValue is true
  var command =
    "setoption name " +
    optionName +
    (optionValue ? " value " + optionValue : "") +
    endOfLine;
  this.engine.postMessage(command);
  return this.isReadyCommand();
};

Engine.prototype.uciNewGameCommand = function() {
  this.engine.postMessage("ucinewgame" + endOfLine);
  return this.isReadyCommand();
};

Engine.prototype.positionCommand = function(fen, moves) {
  var message = "position ";
  if (fen === "startpos") {
    message += "startpos";
  } else {
    message += "fen " + fen;
  }

  if (moves) {
    message += " moves " + moves;
  }
  message += endOfLine;
  this.engine.postMessage(message);
  return this.isReadyCommand();
};

Engine.prototype.timeLimitedGoCommand = function(
  infoHandler,
  whiteMillisRemaining,
  blackMillisRemaining
) {
  var self = this;
  var deferred = Q.defer();

  var engineStdoutListener = function(event) {
    var data = event.data;
    //TODO:Parse info and bestmove

    if (data.startsWith("info") && infoHandler) {
      infoHandler(data);
    } else if (data.startsWith("bestmove")) {
      self.engine.removeEventListener("message", engineStdoutListener, false);
      var moveRegex = /bestmove (\w+)(.*)?/g;
      var match = moveRegex.exec(data);
      if (match) {
        deferred.resolve(utilities.convertToMoveObject(match[1]));
      } else {
        throw new Error(
          'Invalid format of bestmove. Expected "bestmove <move>". Returned "' +
            lines[i] +
            '"'
        );
      }
    }
  };

  this.engine.addEventListener("message", engineStdoutListener, false);
  var commandString =
    "go wtime " + whiteMillisRemaining + " btime " + blackMillisRemaining;
  this.engine.postMessage(commandString + endOfLine);

  return deferred.promise;
};

Engine.prototype.stopCommand = function() {
  var self = this;
  var deferred = Q.defer();

  var engineStdoutListener = function(event) {
    var data = event.data;
    console.log("STOP: " + data);
    if (data.startsWith("bestmove")) {
      if (self.goInfiniteListener) {
        self.engine.removeEventListener(
          "message",
          self.goInfiniteListener,
          false
        );
      }
      self.engine.removeEventListener("message", engineStdoutListener, false);
      var moveRegex = /bestmove (\w+)(.*)?/g;
      var match = moveRegex.exec(data);
      if (match) {
        deferred.resolve(utilities.convertToMoveObject(match[1]));
      } else {
        throw new Error(
          'Invalid format of bestmove. Expected "bestmove <move>". Returned "' +
            lines[i] +
            '"'
        );
      }
    }
  };

  this.engine.addEventListener("message", engineStdoutListener, false);
  this.engine.postMessage("stop" + endOfLine);
  return deferred.promise;
};

// BUG with infinite
Engine.prototype.goCommand = function(commands, infoHandler) {
  var engineStdoutListener = function(event) {
    var data = event.data;
    // console.log("GO COMMAND: " + data);

    //TODO:Parse info and bestmove
    if (data.startsWith("info") && infoHandler) {
      infoHandler(data);
    }
  };

  // create input command
  var inputCommand = "go";
  if (commands === null) {
    inputCommand += endOfLine;
  } else {
    for (var command in commands) {
      if (commands.hasOwnProperty(command)) {
        inputCommand += " " + command;
        var value = commands[command];

        // e.g. { 'infinite': null, ... }
        if (value !== null && value !== "") {
          inputCommand += " " + value;
        }
      }
    }
    inputCommand += endOfLine;
  }

  this.goInfiniteListener = engineStdoutListener;
  this.engine.addEventListener("message", engineStdoutListener, false);
  this.engine.postMessage(inputCommand);
  return this.isReadyCommand();
};

module.exports = Engine;
