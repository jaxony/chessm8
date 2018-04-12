var assert = require("assert");
var chai = require("chai");

var Model = require("./model.js");
var modes = require("./modes.js");
var exceptions = require("./exceptions.js");

describe("Model", function() {
  describe("Unit tests", function() {
    describe("#getMode()", function() {
      it("should return 'NORMAL' after init", function() {
        var model = new Model();
        assert.equal(model.getMode(), modes.NORMAL);
      });
    });

    it("#setMode(), should throw INVALID_MODE exception", function() {
      var model = new Model();
      chai
        .expect(
          model.setMode.bind(model, "this is a random invalid mode string")
        )
        .to.throw(exceptions.INVALID_MODE);
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
