
/*MongoDB Setup*/
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var ObjectID = mongodb.ObjectID;
var client = new MongoClient("mongodb://localhost:27017", { useNewUrlParser: true });
var db;

var groups = [];

var express = require("express");

var app = express();

var http = require("http");

var server = http.Server(app);

var socketio = require("socket.io");

var io = socketio(server);

app.use(express.static("pub"));

io.on("connection", function(socket) {
	console.log("Somebody connected...");

	socket.on("getGroupItems", function() {
		db.collection("items").find({}).toArray(function(err, docs) {
			if (err!=null) {
				console.log("ERROR: " + err);
			}
			else {
				socket.emit("updateItemList", docs);
			}
		});
	});

	socket.on("disconnect", function() {
		console.log("Somebody disconnected.");
	});
	
	socket.on("receiveItemFromClient", function(name, quantity, comment, priority) {
		io.emit("displayItemFromServer", name, quantity, comment, priority);
	});
});


function findAll(collection) {
	db.collection(collection).find({}).toArray(function(err, result) {
		if(err) throw err;
		//console.log(result);
		client.close();
	});
}

function insertNewItem(collection, objToInsert) {
	db.collection(collection).insertOne(objToInsert, function(err,res) {
		if (err) throw err;
		//console.log("1 item inserted");
		client.close();
	})
}


client.connect(function(err) {
	if (err != null) throw err;
	else {
		db = client.db("shop365");

		//findAll("items");

		/*var newItem = {
			name: "toothpaste",
			priority: false,
			groupid: "test_group",
			date: Date(),
			quantity: 1,
			purchased: false,
			comments: "No rush on this!"
		};

		//insertNewItem("items",newItem);
		//findAll("items");

		//console.log("Here are the groups")*/

		/*db.collection("items").distinct('groupid', function(err, result) {
			if(err) throw err;
			groups = result;
			//console.log(groups);
			client.close();
		});*/


		server.listen(80, function() {
			console.log("Server with socket.io is ready.");
		});
	}
});

