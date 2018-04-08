const webpack = require("webpack");
const path = require("path");

module.exports = {
  entry: path.join(__dirname, "index.js"),
  output: {
    path: path.join(__dirname, "static", "js"),
    filename: "bundle.js",
    publicPath: path.join(__dirname, "static")
  }
};
