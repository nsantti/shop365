
//This is JavaScript's version of an "include" or "import":
var express = require("express");

//get an instance of express
var server = express();

//serve up any files in the pub folder, relative to the current folder (.html files, .jpg files, .txt., etc.)
server.use(express.static("pub")); 

//Boilerplate to get variables passed from client to server with the syntax "req.body.whateverVariable"
var bodyParser = require("body-parser");
server.use(bodyParser.urlencoded({extended: true}));


server.listen(80, function() { //port 80 is for HTTP
    console.log("Server is waiting on port 80."); //This message is printed once the server is ready.
});
