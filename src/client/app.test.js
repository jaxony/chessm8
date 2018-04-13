/**
 * Integration testing between components.
 */

const assert = require("assert");
const chai = require("chai");

const modes = require("./model/modes");

const JSDOM = require("jsdom").JSDOM;
const dom = new JSDOM(
  '<!DOCTYPE html><html><head></head><body><div id="board"></div></body></html>'
);

// var Worker = function Worker(stringUrl) {
//   this.url = stringUrl;
//   this.onmessage = () => {};
// };

// Worker.prototype.postMessage = function(msg) {
//   this.onmessage(msg);
// };

global.window = dom.window;
global.document = dom.window.document;
const $ = require("jquery")(dom.window);
global.window.jQuery = $;

function startNewApp() {
  const App = require("./app");
  const app = new App();
  app.start();
  return app;
}

describe("Integration", function() {
  const MOVE = "e2-e4";
  it("checks if normal mode has no ghosts", function() {
    const app = startNewApp();
    assert.equal(app.model.getMode(), modes.NORMAL);
    app.board.move(MOVE);
    console.log(document);
    assert($(".ghost-12abc").length === 0);
  });

  it("checks if rank mode has one ghost", function() {
    const app = startNewApp();
    app.model.setMode(modes.RANK);
    assert.equal(app.model.getMode(), modes.RANK);
    console.log(app.board.move(MOVE));
    assert($(".ghost-12abc").length === 1);
  });
});
