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

To motivate players to place effort into explicitly ranking moves, the game rewards perfect rankings with fun rewards. Such rewards include:

* **Call a Friend**: What Stockfish deems to be the best of the player's 3 moves will be chosen as the move to play.
* **The Fiver**: The player can boost the number of rankings to 5. This reward is particularly powerful when combined with **Call a Friend**.
* **More coming soon.**

## Overview of the technology

* Chessm8 runs entirely in the client
* No server requests involved apart from initially donwloading the static files (i.e., `.html`, `.js`, `.css`) from a barebones Node.js `Express` server

## How to play

Go to the <website>.

## Getting Started

### Set up your Node.js development environment

* You need to have Node.js (`>= v9.11.1`) installed to run JavaScript outside of the browser.
  * MacOS: Run `brew install node`
  * Linux: Run `sudo apt-get install nodejs`
  * Windows: [See this tutorial](http://blog.teamtreehouse.com/install-node-js-npm-windows)
* You need the `yarn` package manager for Node.js.
  * Run `npm install yarn`
  * `npm` is the default **n**ode **p**ackage **m**anager. This project just uses an alternative package manager from Facebook, `yarn`, to manage packages.

### Get the code

1.  Ensure you have the version control software `git` installed.

* See the [tutorial from Atlassian](https://www.atlassian.com/git/tutorials/install-git) on how to install `git` on your system.
* `git` keeps track of code changes and helps teams work on a codebase at the same time. If this is your first time using `git`, you will need to read through [these tutorials](https://www.atlassian.com/git/tutorials/what-is-version-control) to start contributing.

2.  Clone the code in this repository to your machine by running `git clone https://github.com/jaxony/chessm8` in a directory where you want to put this project.

### Install the packages

The `package.json` you just cloned details all of our software dependencies (i.e., code that other people wrote and are being used in this project). Now download these packages with our package manager `yarn`.

```bash
cd chessm8 # make sure you are at the project root directory
yarn install
```

### Start the server

```bash
yarn run server:dev
```

### Open your browser

Open your browser and go to `http://localhost:3000` (`localhost` is the name for the IP address of your local machine, and `3000` is the port number on which the server that we just started is being run).

## Workflow for developing

### Build tools

1.  Run `yarn client:dev` to start `webpack-cli`, which watches for changes in all the frontend code in the `src/client` directory.
2.  Run `yarn server:dev` to start an auto-restarting server that uses `nodemon` to watch for file changes on the back-end (will remove `nodemon` soon as backend almost never changes).

### Tests

> Not working fully yet.

We use `mocha` as the testing framework, and `chai` for its `#expect` function.

* Test as you change the code to avoid adding new bugs and causing regressions in the code. Do this by running `yarn test`.

* Add new tests in test files named `*.test.js`. These test files are found in `src` and are placed right next to their corresponding application code.

## Application Architecture

![](./docs/diagrams/architecture.png)