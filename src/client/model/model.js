/**
 * Contains the application state.
 */

var modes = require("./modes.js");
var exceptions = require("./exceptions.js");

var Model = function Model() {
  this.state = {
    abilities: {},
    mode: modes.NORMAL
  };
};

Model.prototype.getMode = function() {
  return this.state.mode;
};

Model.prototype.setMode = function(mode) {
  if (modes[mode] === undefined) {
    throw exceptions.INVALID_MODE;
  }
  this.state.mode = mode;
};

module.exports = Model;
