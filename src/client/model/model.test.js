var Model = require("./model.js");
var modes = require("./modes.js");
var exceptions = require("./exceptions.js");

var assert = require("assert");

describe("Model", function() {
  describe("Unit tests", function() {
    describe("#getMode()", function() {
      it("should return 'NORMAL' after init", function() {
        var model = new Model();
        assert.equal(model.getMode(), modes.NORMAL);
      });
    });
  });

  describe("Integration tests", function() {
    describe("#setMode() after #getMode()", function() {
      it("should return 'RANK' after setMode(modes.RANK)", function() {
        var model = new Model();
        model.setMode(modes.RANK);
        assert.equal(model.getMode(), modes.RANK);
      });
    });
  });
});
