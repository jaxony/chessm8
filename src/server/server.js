var express = require('express');
var http = require('http');
var path = require('path');
var Promise = require('bluebird');

var app = express();
const port = process.env.PORT || 3000;
app.set('port', port);
var server = http.Server(app);
var io = require('socket.io')(server);

// chess
var Chess = require('chess.js').Chess;

var TIMES = { // millisecs
  EVAL_POSITION: 250,
  EVAL_PER_MOVE: 333,
  MOVE_TIME: 500
};

var STOCKFISH_LEVEL = '10';

// stock fish
// var stockfish = require('stockfish');
// var engine = stockfish();
var Engine = require('@jaxony/uci');
var engine = new Engine(path.join(__dirname, 'stockfish-9-64'));
engine.runProcess().then(function () {
  console.log('Started');
  return engine.uciCommand();
}).then(function (idAndOptions) {
  console.log('Engine name - ' + idAndOptions.id.name);
  return engine.setOptionCommand('Skill Level', STOCKFISH_LEVEL);
}).then(function () {
  console.log('Skill Level: ' + STOCKFISH_LEVEL);
}).catch(function (err) {
  console.log('Chess engine cannot start!');
  console.log(err);
});

// express
app.use(express.static(path.join(__dirname, '../client/static')));
app.get('*', function(req, res) {
  res.send('404 Page not found');
});
server.listen(app.get('port'), function(){
  console.log('listening on *:' + app.get('port'));
});

// socket.io
var activeGames = {};
var moveEvalScores = {};

var parseCentipawnEvaluation = function(infoLine) {
  // centipawn regex for evaluation score
  var cpRegex = /cp (-?[0-9]+)/;
  var match = cpRegex.exec(infoLine);
  if (match) {
    var cp = match[1];
    return cp;
  } else {
    // mate
    // var mateRegex = /mate ([0-9]+)/;
    // match = mateRegex.exec(infoLine);
    // var mateInNMoves = match[1];
    // return makeInNMoves;
    return -100000; // basically lost as checkmate soon!
  }
  return cp;
};

var evaluatePosition = function(game) {
  lastInfo = '';
  return engine.isReadyCommand().then(function() {
    return engine.positionCommand(game.fen());
  }).then(function() {
    return engine.goInfiniteCommand(function infoHandler(info) {
      lastInfo = info;
      console.log(info);
    });
  }).delay(TIMES.EVAL_POSITION).then(function() {
    return engine.stopCommand();
  }).then(function() {
    var score = parseCentipawnEvaluation(lastInfo);
    return parseInt(score);
  }).catch(function(err) {
    throw err;
  });
};

var evaluateMove = function(moveObj, game) {
  var lastInfo = '';
  
  // unpack moveObj
  var moveId = moveObj.id;
  var move = moveObj.move;

  var moveString = move.from + move.to; // e.g. e2e4
  return engine.isReadyCommand().then(function () {
      return engine.positionCommand(game.fen());
    }).then(function () {
      console.log('Starting analysis');
      return engine.goCommand({
          infinite: null,
          searchmoves: moveString
        },
        function infoHandler(info) {
          // console.log(info);
          lastInfo = info;
        });
    }).delay(TIMES.EVAL_PER_MOVE).then(function () {
        console.log('Stopping analysis');
        return engine.stopCommand();
    }).then(function() {
      console.log(lastInfo);
      var score = parseCentipawnEvaluation(lastInfo);
      return parseInt(score);
    }).catch(function(err) {
      console.log(err.message);
    });
}

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.on('newGame', function(msg) {
    console.log('New game created');
    // socket.emit('server says: started a new game');
    // var newGameId = generateGameId();
    activeGames[socket.id] = new Chess();
    socket.emit('newGame', { gameId: socket.id });
  });

  // user submitted multiple moves for analysis
  socket.on('moves', function(msg) {
    console.log('Evaluating user submitted moves...');
    console.log(msg.moves);
    var currGame = activeGames[socket.id];

    // evaluation scores from Stockfish in unit Centipawns
    var scores = [];

    var moves = msg.moves;

    Promise.mapSeries(moves, function(move) {
      console.log(move);
      return evaluateMove(move, currGame);
    }).then(function(scores) {
      socket.emit('moves', { moves: msg.moves, scores: scores });
    }).catch(function(err) {
      console.log(err.message);
    });
  });

  socket.on('setBoardPosition', function(msg) {
    var currGame = activeGames[socket.id];
    currGame.load(msg.fen);
    console.log("Server has loaded new position");
  });

  socket.on('move', function(msg) {
    // socket.broadcast.emit('move', msg);
    // activeGames[msg.gameId].board = msg.board;
    // console.log(msg);
    console.log("new move in game");
    console.log("Server says: received new move " + JSON.stringify(msg.move));

    // client's move
    // 1. make move for player
    // 2. find stockfish move
    // 3. emit move via WebSocket

    var currGame = activeGames[socket.id];
    if (currGame === undefined) {
      console.log("##########################");
    }
    makePlayerMove(currGame, msg.move).then(function() {
      return chooseComputerMove(currGame);
    }).then(function(move) {
      makeComputerMove(currGame, move);
      return move;
    }).then(function(move) {
      console.log('Server has calculated its move: ' + move);
      socket.emit('move', { move: move });
    }).then(function() {
      console.log(currGame.ascii());
      console.log('Server has sent its move to the client.');
    }).then(function() {
      // score player's new position
      // TODO: Could have a race condition here where
      // user sends back move in less than EVAL_TIME.
      // Not sure if Stockfish handles multiple processes
      // automatically, probably not??
      // So... FIX: should move socket.emit('move', ...) to after
      // 'evaluation' event emission
      return evaluatePosition(currGame);
    }).then(function(score) {
      socket.emit('evaluation', { score: score });
    }).catch(function(err) {
      throw err;
    });
  });

  socket.on('disconnect', function(msg) {
    console.log('user disconnected');
    delete activeGames[socket.id];
    
    // if (socket && socket.gameId) {
    //   console.log(socket.gameId + ' disconnected');
    // }
    
    // delete lobbyUsers[socket.userId];
    
    // socket.broadcast.emit('logout', {
    //   userId: socket.userId,
    //   gameId: socket.gameId
    // });
  });
});

var chooseComputerMove = function(game) {
	return chooseStockfishMove(game);
  // return makeRandomMove(game);
};

var makeComputerMove = function(game, move) {
  console.log("Server made its move: " + JSON.stringify(move));
  game.move(move);
}

var makePlayerMove = function(game, move) {
	return new Promise(function(resolve) {
		game.move(move);
		console.log("1. Made player move");
		resolve(game.fen());
	});
}

var chooseStockfishMove = function(game) {
	return engine.isReadyCommand().then(function() {
    }).then(function () {
      console.log('Engine is ready to calculate!');
    }).then(function () {
      return engine.positionCommand(game.fen());
    }).then(function () {
      console.log('Starting analysis');
      return engine.goInfiniteCommand();
    }).delay(TIMES.MOVE_TIME).then(function () {
        console.log('Stopping analysis');
        return engine.stopCommand();
    }).catch(function(err) {
      console.log(err.message);
    });
};

var makeRandomMove = function(game) {
	var possibleMoves = game.moves();

  // game over
  if (possibleMoves.length === 0) return;

  var randomIndex = Math.floor(Math.random() * possibleMoves.length);
  const move = possibleMoves[randomIndex];
  game.move(move);
  return move;
};