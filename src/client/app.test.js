/**
 * Integration testing between components.
 */

const assert = require("assert");
const chai = require("chai");

const $ = require("jquery");

const modes = require("./model/modes");

function startNewApp() {
  const App = require("./app");
  const app = new App();
  app.start();
  return app;
}

describe("Integration", function() {
  before(function() {
    this.jsdom = require("jsdom-global")();
  });

  after(function() {
    this.jsdom = require("jsdom-global")();
  });

  it("checks if normal mode has no ghosts", function() {
    const app = startNewApp();
    assert.equal(app.model.getMode(), modes.NORMAL);
    // app.board.move({from: "e2", to: "e4"});
    // chai.expect();
  });
});
