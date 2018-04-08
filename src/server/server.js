var express = require("express");
var http = require("http");
var path = require("path");

var app = express();
const port = process.env.PORT || 3000;
app.set("port", port);
var server = http.Server(app);

app.use(express.static(path.join(__dirname, "../client/static")));

app.get("*", function(req, res) {
  res.send("404 Page not found");
});

server.listen(app.get("port"), function() {
  console.log("listening on *:" + app.get("port"));
});
