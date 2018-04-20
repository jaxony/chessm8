# Chessm8

## What is this project?

Chessm8 (pronouned "chessmate") is about chess, teaching and technology. We want to make an innovative web application that helps beginners and intermediates learn chess more effectively.

### Goal

The app needs to be simple, fun and educational.

* **Simple**: Minimal additions to the normal game of chess
* **Fun**: Players will want to play this instead of normal chess (not all the time, obviously)
* **Educational**: Players will learn something that they wouldn't otherwise learn from other chess applications

### What have we done so far?

#### Educational: Ranking chess moves

We believe that success in chess requires several types of thinking. One of these is being able to **think broadly**. To help players with this process of enumerating their moves choices and evaluating them, players are asked to rank their moves from best to worst. Feedback is provided using a chess engine.

Here are the three types of thinking important to chess:

* Thinking broadly
* Thinking deeply
* Thinking as the opponent

#### Fun: Rewards

To motivate players to place effort into explicitly ranking moves, the game rewards perfect rankings with fun rewards. Such rewards including:

* **Call a Friend**: What Stockfish deems to be the best of the player's 3 moves will be chosen as the move to play.
* **The Fiver**: The player can boost the number of rankings to 5. This reward is particularly powerful when combined with **Call a Friend**.
* **More coming soon.**

## Overview of the technology

* Chessm8 is a web application that runs entirely in the client
* No server requests involved apart from initially donwloading the static files (i.e., `.html`, `.js`, `.css`) from a barebones Node.js `Express` server
